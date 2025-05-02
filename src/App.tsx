
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ContentProvider } from '@/contexts/ContentContext';
import { Toaster } from 'sonner';
import Content from '@/pages/Content';

function App() {
  return (
    <AuthProvider>
      <ContentProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Content />} />
          <Route path="/content" element={<Content />} />
        </Routes>
      </ContentProvider>
    </AuthProvider>
  );
}

export default App;
