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
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error && !documents.length) {
    return (
      <div className="flex h-screen flex-col bg-white">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-slate-900 mb-2">Something went wrong</h1>
            <p className="text-slate-600 mb-6">{error}</p>
            <button onClick={() => window.location.reload()} className="btn btn-primary">
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-white">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          documents={documents}
          loading={loading}
          onCreate={handleCreate}
          collapsed={!sidebarOpen}
        />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100 min-h-full px-8 py-12 md:px-12 md:py-16">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto mb-16">
              <div className="text-center mb-12">
                <h1 className="text-5xl md:text-6xl font-display font-bold text-slate-900 mb-4">
                  Welcome to <span className="text-gradient">Docwise</span>
                </h1>
                <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                  Collaborate seamlessly. Edit together. Create amazing things.
                </p>
                <button
                  onClick={handleCreate}
                  className="btn btn-primary text-lg px-8 py-3 group"
                >
                  <span className="text-2xl group-hover:scale-125 transition-transform">+</span>
                  Create New Document
                </button>
              </div>

              {/* Search */}
              {!loading && documents.length > 0 && (
                <div className="mb-12">
                  <div className="relative max-w-md mx-auto mb-8">
                    <input
                      type="text"
                      placeholder="Search your documents..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-5 py-3 pl-12 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-md"
                    />
                    <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Documents Grid */}
            {loading ? (
              <div className="max-w-7xl mx-auto">
                <h2 className="text-2xl font-display font-bold text-slate-900 mb-6">Your Documents</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-40 rounded-xl bg-gradient-to-br from-slate-200 to-slate-100 animate-pulse" />
                  ))}
                </div>
              </div>
            ) : filteredDocuments.length > 0 ? (
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-2xl font-display font-bold text-slate-900">Your Documents</h2>
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">
                    {filteredDocuments.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => navigate(`/documents/${doc.id}`)}
                      className="card-hover cursor-pointer group p-6 hover:scale-105 active:scale-95"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-4xl group-hover:scale-125 transition-transform">📄</div>
                        <svg className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {doc.title}
                      </h3>
                      <p className="text-sm text-slate-500 mb-4">
                        Click to open and start editing
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>📅</span>
                        <span>Recently accessed</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-7xl mx-auto text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">No documents found</h2>
                <p className="text-slate-600 mb-6">
                  {searchQuery ? "Try a different search" : "Get started by creating your first document"}
                </p>
                {!searchQuery && (
                  <button onClick={handleCreate} className="btn btn-primary">
                    Create First Document
                  </button>
                )}
              </div>
            )}

            {/* Features Section */}
            {documents.length === 0 && !loading && (
              <div className="max-w-7xl mx-auto mt-20 pt-20 border-t border-slate-200">
                <h2 className="text-3xl font-display font-bold text-slate-900 text-center mb-12">
                  Why Choose Docwise?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { icon: '⚡', title: 'Lightning Fast', desc: 'Real-time collaboration with zero lag' },
                    { icon: '🤝', title: 'Team Ready', desc: 'Invite anyone and work together' },
                    { icon: '💾', title: 'Always Saved', desc: 'Auto-save with full version history' },
                  ].map((feature, idx) => (
                    <div key={idx} className="card p-8 text-center hover:-translate-y-2 transition-transform">
                      <div className="text-5xl mb-4">{feature.icon}</div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                      <p className="text-slate-600">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DocumentListPage;

