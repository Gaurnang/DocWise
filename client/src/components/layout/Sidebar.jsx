import DocumentList from '../documents/DocumentList.jsx';

function Sidebar({ documents, onCreate, newTitle, setNewTitle, loading }) {

  return (
    <aside className="flex h-full w-72 flex-col border-r border-borderSubtle bg-sidebar">
      <div className="px-4 pb-3 pt-4">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Documents
        </h2>
        <button
          type="button"
          onClick={onCreate}
          disabled={loading || !newTitle.trim()}
          className="mb-3 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
        >
          + Create New Document
        </button>
        <div className="flex items-center gap-2 rounded-md bg-white px-3 py-2 shadow-sm">
          <input
            type="text"
            placeholder="New document title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full border-none bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0"
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        <DocumentList documents={documents} />
      </nav>
    </aside>
  );
}

export default Sidebar;

