
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { ContentContext } from '@/contexts/ContentContext';
import KeywordsTabs from './components/KeywordsTabs';
import KeywordsHeader from './components/KeywordsHeader';

const KeywordsPage = () => {
  const navigate = useNavigate();
  const { setSelectedKeywords } = useContext(ContentContext);
  const [activeTab, setActiveTab] = useState('research');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValue, setFilterValue] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [animateTabs, setAnimateTabs] = useState(false);

  // Animation effect when changing tabs
  useEffect(() => {
    setAnimateTabs(true);
    const timer = setTimeout(() => setAnimateTabs(false), 300);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const handleCreateCluster = () => {
    toast.info("Creating a new keyword cluster", {
      description: "This feature will be available soon!"
    });
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      toast.success("Keywords exported successfully!", {
        description: "Your data has been exported to CSV."
      });
    }, 1500);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Keywords refreshed successfully!");
    }, 1500);
  };

  const handleUseKeyword = (keyword: string) => {
    // Add the keyword to the content editor via the context
    setSelectedKeywords(prev => [...prev, keyword]);
    toast.success(`Added "${keyword}" to your content keywords`, {
      action: {
        label: "Go to Content Editor",
        onClick: () => navigate("/content")
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container py-8 animate-fade-in">
        <div className="space-y-8">
          <KeywordsHeader onCreateCluster={handleCreateCluster} />
          
          <KeywordsTabs 
            activeTab={activeTab}
            onTabChange={setActiveTab}
            animateTabs={animateTabs}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterValue={filterValue}
            onFilterChange={setFilterValue}
            isLoading={isLoading}
            isExporting={isExporting}
            onRefresh={handleRefresh}
            onExport={handleExport}
            onUseKeyword={handleUseKeyword}
          />
        </div>
      </main>
    </div>
  );
};

export default KeywordsPage;
