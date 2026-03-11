import { Link, useLocation } from 'react-router-dom';

function DocumentList({ documents }) {
  const location = useLocation();

  if (!documents.length) {
    return (
      <div className="px-2 py-12 text-center">
        <div className="text-4xl mb-2">📝</div>
        <p className="text-sm text-slate-500">No documents here yet</p>
      </div>
    );
  }

  return (
    <ul className="space-y-1.5">
      {documents.map((doc) => {
        const isActive = location.pathname === `/documents/${doc.id}`;
        return (
          <li key={doc.id}>
            <Link
              to={`/documents/${doc.id}`}
              className={`block group px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 truncate ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title={doc.title}
            >
              <div className="flex items-center gap-2">
                <span className={`text-base ${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                  📄
                </span>
                <span className="flex-1 truncate">{doc.title}</span>
                {isActive && (
                  <span className="text-lg">✓</span>
                )}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default DocumentList;

