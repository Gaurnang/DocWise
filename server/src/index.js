const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const PORT = 4000;

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

app.get('/api/documents/:id', (req, res) => {
  const { id } = req.params;
  const doc = documents.find((d) => d.id === id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }
  res.json(doc);
});

app.post('/api/documents', (req, res) => {
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
  res.status(201).json(newDoc);
});

app.put('/api/documents/:id', (req, res) => {
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
    doc.content = content;
  }

  res.json(doc);
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

  socket.on('join_document', ({ documentId }) => {
    if (!documentId) return;
    socket.join(documentId);
  });

  socket.on('doc_update', ({ documentId, content }) => {
    if (!documentId || typeof content !== 'string') return;

    const doc = documents.find((d) => d.id === documentId);
    if (doc) {
      doc.content = content;
    }

    socket.to(documentId).emit('doc_update', { content });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server with Socket.io listening on http://localhost:${PORT}`);
});

