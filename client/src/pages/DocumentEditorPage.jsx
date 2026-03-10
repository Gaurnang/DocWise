import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import * as Y from 'yjs';
import Navbar from '../components/layout/Navbar.jsx';
import Sidebar from '../components/layout/Sidebar.jsx';
import EditorContainer from '../components/editor/EditorContainer.jsx';

const API_BASE = 'http://localhost:4000';

function DocumentEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const ydocRef = useRef(null);
  const isRemoteRef = useRef(false);
  const [documents, setDocuments] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const res = await fetch(`${API_BASE}/api/documents`);
        if (!res.ok) return;
        const list = await res.json();
        setDocuments(list);
      } catch (err) {
        console.error(err);
      }
    }

    async function fetchDocument() {
      try {
        const res = await fetch(`${API_BASE}/api/documents/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError('Document not found');
            return;
          }
          throw new Error('Failed to fetch document');
        }
        const doc = await res.json();
        setTitle(doc.title);
        setContent(doc.content);
      } catch (err) {
        console.error(err);
        setError('Failed to load document');
      } finally {
        setLoading(false);
      }
    }

    fetchDocuments();
    fetchDocument();
  }, [id]);

  async function handleCreateDocument() {
    try {
      const res = await fetch(`${API_BASE}/api/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Untitled Document', content: '' }),
      });
      if (!res.ok) throw new Error('Failed to create document');
      const created = await res.json();
      setDocuments((prev) => [...prev, { id: created.id, title: created.title }]);
      navigate(`/documents/${created.id}`);
    } catch (err) {
      console.error(err);
      setError('Failed to create document');
    }
  }

  // --- Yjs + Socket.IO collaboration (unchanged logic) ---
  useEffect(() => {
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;
    const ytext = ydoc.getText('content');

    const socket = io(API_BASE, { transports: ['websocket'] });
    socketRef.current = socket;

    ydoc.on('update', (update, origin) => {
      if (origin === 'remote') return;
      socket.emit('yjs_update', { documentId: id, update: Array.from(update) });
    });

    ytext.observe(() => {
      setContent(ytext.toString());
    });

    socket.on('connect', () => {
      socket.emit('join_document', { documentId: id });
    });

    socket.on('yjs_sync', ({ update }) => {
      isRemoteRef.current = true;
      Y.applyUpdate(ydoc, new Uint8Array(update), 'remote');
      isRemoteRef.current = false;
    });

    socket.on('yjs_update', ({ update }) => {
      isRemoteRef.current = true;
      const u8 = Array.isArray(update)
        ? new Uint8Array(update)
        : new Uint8Array(update.data || []);
      Y.applyUpdate(ydoc, u8, 'remote');
      isRemoteRef.current = false;
    });

    socket.on('doc_update', ({ content: newContent }) => {
      if (!isRemoteRef.current) setContent(newContent);
    });

    socket.on('title_update', ({ title: nextTitle }) => {
      setTitle(nextTitle);
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === id ? { ...doc, title: nextTitle } : doc,
        ),
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      ydoc.destroy();
      ydocRef.current = null;
    };
  }, [id]);

  async function handleSave() {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/documents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) throw new Error('Save failed');
      await res.json();
      setMessage('Saved');
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === id ? { ...doc, title } : doc,
        ),
      );
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      console.error(err);
      setError('Failed to save document');
    } finally {
      setSaving(false);
    }
  }

  function handleTitleChange(nextTitle) {
    setTitle(nextTitle);
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id ? { ...doc, title: nextTitle } : doc,
      ),
    );
    if (socketRef.current) {
      socketRef.current.emit('title_update', {
        documentId: id,
        title: nextTitle,
      });
    }
  }

  const saveStatus = saving ? 'saving' : message ? 'saved' : 'idle';

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[var(--bg)]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--line)] border-t-[var(--accent)]" />
          <span className="text-sm text-[var(--muted)]">Loading document...</span>
        </div>
      </div>
    );
  }

  if (error && !content && !title) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-[var(--bg)]">
        <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-6 py-5 text-center shadow-sm">
          <p className="text-sm text-[var(--red)]">{error}</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-4 rounded-md bg-[var(--hover)] px-4 py-2 text-sm text-[var(--ink)] transition-colors hover:bg-[var(--active)]"
          >
            Back to documents
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-[var(--bg)]">
      <Navbar
        saveStatus={saveStatus}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
      />
      <div className="flex min-h-0 flex-1">
        <Sidebar
          documents={documents}
          onCreate={handleCreateDocument}
          loading={false}
          collapsed={!sidebarOpen}
        />

        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {/* Editor area */}
          <EditorContainer>
            {/* Title input */}
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full border-none bg-transparent pt-16 pb-3 text-[42px] font-[800] leading-[1.2] tracking-[-0.02em] text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none"
              placeholder="Untitled"
            />

            {/* Content textarea */}
            <textarea
              value={content}
              onChange={(e) => {
                const next = e.target.value;
                const ydoc = ydocRef.current;
                if (ydoc) {
                  const ytext = ydoc.getText('content');
                  ydoc.transact(() => {
                    if (ytext.length > 0) ytext.delete(0, ytext.length);
                    ytext.insert(0, next);
                  }, 'local');
                } else {
                  setContent(next);
                  if (socketRef.current) {
                    socketRef.current.emit('doc_update', {
                      documentId: id,
                      content: next,
                    });
                  }
                }
              }}
              className="mt-6 min-h-[60vh] w-full resize-none border-none bg-transparent text-[16px] leading-[1.85] text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none"
              placeholder="Start writing..."
            />
          </EditorContainer>
        </main>
      </div>
    </div>
  );
}

export default DocumentEditorPage;

