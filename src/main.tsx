
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { HelmetProvider } from 'react-helmet-async';
import { TourProvider } from '@/contexts/TourContext';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <TourProvider>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </TourProvider>
  </React.StrictMode>,
);
