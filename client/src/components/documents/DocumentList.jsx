import { Link, useLocation } from 'react-router-dom';

function DocumentList({ documents }) {
  const location = useLocation();

  return (
    <ul className="space-y-1">
      {documents.map((doc) => {
        const isActive = location.pathname === `/documents/${doc.id}`;
        return (
          <li key={doc.id}>
            <Link
              to={`/documents/${doc.id}`}
              className={`flex items-center justify-between rounded-md px-3 py-2 text-sm ${
                isActive
                  ? 'bg-white font-medium text-gray-900 shadow-sm'
                  : 'text-gray-700 hover:bg-white hover:text-gray-900'
              }`}
            >
              <span className="truncate">{doc.title}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default DocumentList;

