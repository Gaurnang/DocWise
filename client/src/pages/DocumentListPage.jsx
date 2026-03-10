import { useEffect, useState } from 'react';
import Sidebar from '../components/layout/Sidebar.jsx';

const API_BASE = 'http://localhost:4000';

function DocumentListPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newTitle, setNewTitle] = useState('');

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
    if (!newTitle.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, content: '' }),
      });
      const created = await res.json();
      setDocuments((prev) => [...prev, { id: created.id, title: created.title }]);
      setNewTitle('');
    } catch (err) {
      console.error(err);
      setError('Failed to create document');
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-500">
        Loading documents...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <Sidebar
        documents={documents}
        onCreate={handleCreate}
        newTitle={newTitle}
        setNewTitle={setNewTitle}
        loading={loading}
      />
      <section className="flex flex-1 flex-col bg-slate-50">
        <div className="mx-auto flex h-full w-full max-w-3xl flex-col justify-center px-6 py-8">
          <h1 className="mb-3 text-2xl font-semibold text-gray-900">
            Welcome to your workspace
          </h1>
          <p className="mb-6 text-sm text-gray-500">
            Select an existing document from the sidebar on the left, or create
            a new one to get started.
          </p>
        </div>
      </section>
    </div>
  );
}

export default DocumentListPage;

