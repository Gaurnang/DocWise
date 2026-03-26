import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import DocumentListPage from './pages/DocumentListPage.jsx';
import DocumentEditorPage from './pages/DocumentEditorPage.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/documents" element={<DocumentListPage />} />
      <Route path="/documents/:id" element={<DocumentEditorPage />} />
    </Routes>
  );
}

export default App;
