import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import * as Y from 'yjs';
import Navbar from '../components/layout/Navbar.jsx';
import Sidebar from '../components/layout/Sidebar.jsx';
import EditorContainer from '../components/editor/EditorContainer.jsx';
import EditorToolbar from '../components/editor/EditorToolbar.jsx';

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
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

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
        updateStats(doc.content);
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

  const updateStats = (text) => {
    setCharCount(text.length);
    setWordCount(text.trim().split(/\s+/).filter(w => w.length > 0).length);
  };

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

  // --- Yjs + Socket.IO collaboration ---
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
      const newContent = ytext.toString();
      setContent(newContent);
      updateStats(newContent);
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
      <div className="flex h-screen flex-col bg-white">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="inline-flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />
            </div>
            <span className="text-sm text-slate-500">Loading document...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !content && !title) {
    return (
      <div className="flex h-screen flex-col bg-white">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex flex-1 items-center justify-center">
          <div className="rounded-xl border border-red-200 bg-red-50 px-8 py-8 text-center shadow-sm max-w-sm">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-base font-medium text-red-900 mb-2">Document not found</p>
            <p className="text-sm text-red-700 mb-6">{error}</p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn btn-primary w-full"
            >
              Back to documents
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-white overflow-hidden">
      <Navbar
        title={title || 'Untitled'}
        saveStatus={saveStatus}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
      />
      
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar
          documents={documents}
          onCreate={handleCreateDocument}
          loading={false}
          collapsed={!sidebarOpen}
        />

        {/* Main editor content */}
        <main className="flex flex-1 flex-col min-h-0 overflow-hidden">
          <EditorContainer>
            {/* Toolbar */}
            <EditorToolbar />
            
            {/* Editor content */}
            <div className="flex-1 flex flex-col overflow-y-auto">
              {/* Title input */}
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="px-8 pt-12 pb-2 text-5xl font-display font-bold leading-tight text-slate-900 placeholder-slate-300 focus:outline-none bg-transparent"
                placeholder="Untitled Document"
              />

              {/* Subtitle with stats */}
              <div className="px-8 pb-8 flex items-center gap-4 text-sm text-slate-500 border-b border-slate-200">
                <span>📝 {wordCount} words</span>
                <span>•</span>
                <span>🔤 {charCount} characters</span>
              </div>

              {/* Content textarea */}
              <textarea
                value={content}
                onChange={(e) => {
                  const next = e.target.value;
                  updateStats(next);
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
                className="flex-1 px-8 py-6 w-full resize-none border-none bg-transparent text-lg leading-relaxed text-slate-900 placeholder-slate-400 focus:outline-none"
                placeholder="Start typing your document... Begin your creative journey here!"
                spellCheck="true"
              />

              {/* Footer stats */}
              <div className="px-8 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-4">
                  <span>Last saved moments ago</span>
                  <span>•</span>
                  <span>Editing as You</span>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </EditorContainer>
        </main>
      </div>
    </div>
  );
}

export default DocumentEditorPage;

