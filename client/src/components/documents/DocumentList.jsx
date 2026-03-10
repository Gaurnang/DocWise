import { Link, useLocation } from 'react-router-dom';

function DocumentList({ documents }) {
  const location = useLocation();

  if (!documents.length) {
    return (
      <div className="px-2 py-8 text-center text-[13px] text-[var(--muted)]">
        No documents yet
      </div>
    );
  }

  return (
    <ul className="space-y-0.5">
      {documents.map((doc) => {
        const isActive = location.pathname === `/documents/${doc.id}`;
        return (
          <li key={doc.id}>
            <Link
              to={`/documents/${doc.id}`}
              className={`block truncate rounded-lg px-3 py-2 text-[14px] transition-colors ${
                isActive
                  ? 'bg-[var(--active)] font-medium text-[var(--ink)]'
                  : 'text-[var(--ink)] hover:bg-[var(--hover)]'
              }`}
              title={doc.title}
            >
              {doc.title}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default DocumentList;

