import DocumentList from '../documents/DocumentList.jsx';

function Sidebar({ documents, loading, onCreate, collapsed = false }) {
  return (
    <aside
      className={`flex shrink-0 flex-col border-r border-[var(--line)] bg-[var(--sidebar-bg)] transition-all duration-200 ${
        collapsed ? 'w-0 min-w-0 overflow-hidden border-r-0 opacity-0' : 'w-[240px] min-w-[240px] opacity-100'
      }`}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <h2 className="text-[15px] font-semibold text-[var(--ink)]">Documents</h2>
      </div>

      {/* New Document button */}
      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={onCreate}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-50"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M7 2.5v9M2.5 7h9" />
          </svg>
          New Document
        </button>
      </div>

      {/* Document list */}
      <nav className="flex-1 overflow-y-auto px-3 pb-3">
        {loading ? (
          <div className="space-y-1 px-1 pt-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-9 animate-pulse rounded-lg bg-[var(--hover)]" />
            ))}
          </div>
        ) : (
          <DocumentList documents={documents} />
        )}
      </nav>
    </aside>
  );
}

export default Sidebar;

