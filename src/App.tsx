
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ContentProvider } from '@/contexts/ContentContext';
import { Toaster } from 'sonner';
import Content from '@/pages/Content';
import Settings from '@/pages/Settings';

function App() {
  return (
    <AuthProvider>
      <ContentProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Content />} />
          <Route path="/content" element={<Content />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </ContentProvider>
    </AuthProvider>
  );
}

export default App;
