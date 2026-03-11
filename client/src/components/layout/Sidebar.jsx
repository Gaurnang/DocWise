import { useState } from 'react';
import DocumentList from '../documents/DocumentList.jsx';

function Sidebar({ documents, loading, onCreate, collapsed = false }) {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredDocs = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside
      className={`flex flex-col h-screen border-r border-slate-200 bg-white transition-all duration-300 ${
        collapsed ? 'w-0 min-w-0 overflow-hidden opacity-0 border-r-0' : 'w-64 min-w-64 opacity-100'
      }`}
    >
      {/* Header */}
      <div className="shrink-0 border-b border-slate-200 p-6">
        <h2 className="text-sm font-bold text-slate-900 mb-4">Your Workspace</h2>
        
        {/* New Document Button */}
        <button
          type="button"
          onClick={onCreate}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 cursor-pointer group"
        >
          <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Document</span>
        </button>
      </div>

      {/* Search */}
      <div className="shrink-0 px-4 pt-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 pl-9 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Document list */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {loading ? (
          <div className="space-y-2 px-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 rounded-lg bg-gradient-to-r from-slate-200 to-slate-100 animate-pulse" />
            ))}
          </div>
        ) : filteredDocs.length > 0 ? (
          <DocumentList documents={filteredDocs} />
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500">
              {searchQuery ? 'No documents found' : 'No documents yet'}
            </p>
            {!searchQuery && (
              <button
                onClick={onCreate}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-2"
              >
                Create one →
              </button>
            )}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold">
            U
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">You</p>
            <p className="text-xs text-slate-500 truncate">user@example.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;

