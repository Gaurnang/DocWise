import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import Navbar from '../components/layout/Navbar.jsx';
import EditorToolbar from '../components/editor/EditorToolbar.jsx';
import EditorContainer from '../components/editor/EditorContainer.jsx';

const API_BASE = 'http://localhost:4000';

function DocumentEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
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

    fetchDocument();
  }, [id]);

  useEffect(() => {
    const socket = io(API_BASE, {
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_document', { documentId: id });
    });

    socket.on('doc_update', ({ content: newContent }) => {
      setContent(newContent);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
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
      if (!res.ok) {
        throw new Error('Save failed');
      }
      await res.json();
      setMessage('All changes saved');
      setTimeout(() => setMessage(''), 1500);
    } catch (err) {
      console.error(err);
      setError('Failed to save document');
    } finally {
      setSaving(false);
    }
  }

  const saveStatus = saving ? 'saving' : message ? 'saved' : 'idle';

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-500">
        Loading document...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-red-500">
        <p>{error}</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-md border border-borderSubtle bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <Navbar title={title || 'Untitled document'} saveStatus={saveStatus} />
      <EditorToolbar />
      <EditorContainer>
        <div className="flex flex-col">
          <div className="flex items-center justify-between border-b border-borderSubtle px-6 py-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-md border border-borderSubtle px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
              >
                ← Back
              </button>
            </div>
            <div className="flex items-center gap-3">
              {message && (
                <span className="text-xs text-green-600">{message}</span>
              )}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-2 px-6 py-5">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border-none bg-transparent text-2xl font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0"
              placeholder="Untitled document"
            />
          </div>
          <div className="px-6 pb-6">
            <textarea
              value={content}
              onChange={(e) => {
                const next = e.target.value;
                setContent(next);
                if (socketRef.current) {
                  socketRef.current.emit('doc_update', {
                    documentId: id,
                    content: next,
                  });
                }
              }}
              className="min-h-[400px] w-full resize-none border-none bg-transparent text-sm leading-relaxed text-gray-800 focus:outline-none focus:ring-0"
              placeholder="Start writing here..."
            />
          </div>
        </div>
      </EditorContainer>
    </div>
  );
}

export default DocumentEditorPage;

