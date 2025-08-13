import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { KeywordLibrary } from '@/components/keyword-library/KeywordLibrary';
import { Helmet } from 'react-helmet-async';

const KeywordLibraryPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Keyword Library | Content Platform</title>
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1">
        <KeywordLibrary />
      </main>
    </div>
  );
};

export default KeywordLibraryPage;