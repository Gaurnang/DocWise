import { Routes, Route } from 'react-router-dom';
import DocumentListPage from './pages/DocumentListPage.jsx';
import DocumentEditorPage from './pages/DocumentEditorPage.jsx';

function App() {
  return (
    <div className="flex h-screen flex-col bg-slate-100">
      <Routes>
        <Route path="/" element={<DocumentListPage />} />
        <Route path="/documents/:id" element={<DocumentEditorPage />} />
      </Routes>
    </div>
  );
}

export default App;
