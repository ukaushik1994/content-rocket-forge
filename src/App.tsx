
import { Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import Feedback from '@/pages/Feedback';
import Dashboard from '@/pages/Dashboard';
import Content from '@/pages/Content';
import Solutions from '@/pages/Solutions';
import Account from '@/pages/Account';
import Login from '@/pages/Login';
import { AuthProvider } from '@/contexts/AuthContext';
import { ContentProvider } from '@/contexts/ContentContext';
import { Toaster } from 'sonner';

function App() {
  return (
    <AuthProvider>
      <ContentProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/content" element={<Content />} />
          <Route path="/solutions" element={<Solutions />} />
          <Route path="/account" element={<Account />} />
          <Route path="/login" element={<Login />} />
          <Route path="/feedback" element={<Feedback />} />
        </Routes>
      </ContentProvider>
    </AuthProvider>
  );
}

export default App;
