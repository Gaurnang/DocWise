const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const DocumentManager = require('./collaboration/documentManager');
const FileStorage = require('./persistence/fileStorage');

const app = express();
const PORT = 4000;
const storageDir = path.join(__dirname, '..', 'storage', 'documents');
const fileStorage = new FileStorage(storageDir);
const documentManager = new DocumentManager(fileStorage);

app.use(cors());
app.use(express.json());

let documents = [
  { id: '1', title: 'First Document', content: 'Hello world' },
  { id: '2', title: 'Second Document', content: 'Some text here' },
];

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.get('/api/documents', (req, res) => {
  const list = documents.map(({ id, title }) => ({ id, title }));
  res.json(list);
});

app.get('/api/documents/:id', async (req, res) => {
  const { id } = req.params;
  const doc = documents.find((d) => d.id === id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  try {
    const persistedContent = await documentManager.getText(id, doc.content);
    doc.content = persistedContent;
    res.json(doc);
  } catch (error) {
    console.error('Failed to load persisted document state:', error);
    res.status(500).json({ error: 'Failed to load document state' });
  }
});

app.post('/api/documents', async (req, res) => {
  const { title, content } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const newDoc = {
    id: String(Date.now()),
    title,
    content: content || '',
  };
  documents.push(newDoc);

  try {
    await documentManager.getOrCreate(newDoc.id, newDoc.content);
  } catch (error) {
    console.error('Failed to initialize persisted Yjs document:', error);
  }

  res.status(201).json(newDoc);
});

app.put('/api/documents/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  const doc = documents.find((d) => d.id === id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  if (typeof title === 'string') {
    doc.title = title;
  }
  if (typeof content === 'string') {
    try {
      doc.content = await documentManager.setText(id, content, doc.content);
    } catch (error) {
      console.error('Failed to persist content update:', error);
      return res.status(500).json({ error: 'Failed to persist document content' });
    }
  }

  res.json(doc);
});

app.delete('/api/documents/:id', async (req, res) => {
  const { id } = req.params;
  const index = documents.findIndex((d) => d.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Document not found' });
  }

  documents.splice(index, 1);

  try {
    await fileStorage.deleteSnapshot(id);
  } catch (error) {
    console.error('Failed to delete persisted document file:', error);
  }

  res.json({ success: true });
});

let users = [];

app.post('/api/auth/signup', (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const userExists = users.find(u => u.email === email);
  if (userExists) {
    return res.status(409).json({ error: 'Email already exists' });
  }

  const newUser = {
    id: String(Date.now()),
    email,
    password,
    name,
  };

  users.push(newUser);

  const token = Buffer.from(JSON.stringify({ id: newUser.id, email: newUser.email })).toString('base64');

  res.status(201).json({
    success: true,
    token,
    user: { id: newUser.id, email: newUser.email, name: newUser.name }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = Buffer.from(JSON.stringify({ id: user.id, email: user.email })).toString('base64');

  res.json({
    success: true,
    token,
    user: { id: user.id, email: user.email, name: user.name }
  });
});

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('Client connected', socket.id);

  socket.on('join_document', async ({ documentId }) => {
    if (!documentId) return;
    socket.join(documentId);

    const doc = documents.find((d) => d.id === documentId);
    if (!doc) return;

    try {
      const currentContent = await documentManager.getText(documentId, doc.content);
      doc.content = currentContent;
      socket.emit('doc_update', { content: currentContent });

      const state = await documentManager.getEncodedState(documentId, doc.content);
      socket.emit('yjs_sync', { update: Array.from(state) });
    } catch (error) {
      console.error('Failed to hydrate document state on join:', error);
    }
  });

  socket.on('doc_update', async ({ documentId, content }) => {
    if (!documentId || typeof content !== 'string') return;

    const doc = documents.find((d) => d.id === documentId);
    if (doc) {
      try {
        doc.content = await documentManager.setText(documentId, content, doc.content);
      } catch (error) {
        console.error('Failed to persist incoming text update:', error);
      }
    }

    socket.to(documentId).emit('doc_update', { content });
  });

  socket.on('yjs_update', async ({ documentId, update }) => {
    if (!documentId || !update) return;

    const doc = documents.find((d) => d.id === documentId);
    if (!doc) return;

    try {
      const normalizedUpdate = Array.isArray(update)
        ? new Uint8Array(update)
        : new Uint8Array(update.data || []);
      doc.content = await documentManager.applyUpdate(documentId, normalizedUpdate, doc.content);
      socket.to(documentId).emit('yjs_update', { update });
      socket.to(documentId).emit('doc_update', { content: doc.content });
    } catch (error) {
      console.error('Failed to apply incoming Yjs update:', error);
    }
  });

  socket.on('title_update', ({ documentId, title }) => {
    if (!documentId || typeof title !== 'string') return;

    const doc = documents.find((d) => d.id === documentId);
    if (doc) {
      doc.title = title;
    }

    socket.to(documentId).emit('title_update', { title });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server with Socket.io listening on http://localhost:${PORT}`);
});

