import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar.jsx';
import Navbar from '../components/layout/Navbar.jsx';

const API_BASE = 'http://localhost:4000';

function DocumentListPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const res = await fetch(`${API_BASE}/api/documents`);
        const data = await res.json();
        setDocuments(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load documents');
      } finally {
        setLoading(false);
      }
    }

    fetchDocuments();
  }, []);

  async function handleCreate() {
    try {
      const res = await fetch(`${API_BASE}/api/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Untitled Document', content: '' }),
      });
      const created = await res.json();
      setDocuments((prev) => [...prev, { id: created.id, title: created.title }]);
      navigate(`/documents/${created.id}`);
    } catch (err) {
      console.error(err);
      setError('Failed to create document');
    }
  }

  if (error && !documents.length) {
    return (
      <div className="flex h-full items-center justify-center bg-[var(--bg)]">
        <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-6 py-5 text-sm text-[var(--red)] shadow-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-[var(--bg)]">
      <Navbar
        saveStatus="live"
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
      />
      <div className="flex min-h-0 flex-1">
        <Sidebar
          documents={documents}
          onCreate={handleCreate}
          loading={loading}
          collapsed={!sidebarOpen}
        />

        <main className="flex flex-1 items-center justify-center">
          <div className="max-w-md px-6 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--sidebar-bg)] border border-[var(--line)]">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5">
                <rect x="5" y="3" width="14" height="18" rx="2" />
                <line x1="9" y1="8" x2="15" y2="8" />
                <line x1="9" y1="12" x2="15" y2="12" />
                <line x1="9" y1="16" x2="12" y2="16" />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-[var(--ink)]">
              Welcome to your workspace
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-[var(--secondary)]">
              Select a document from the sidebar to start editing, or create a new one.
            </p>
            <button
              type="button"
              onClick={handleCreate}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-50"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M7 2.5v9M2.5 7h9" />
              </svg>
              New Document
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default DocumentListPage;

