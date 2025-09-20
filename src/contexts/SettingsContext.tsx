import React, { createContext, useContext, useState, useEffect } from 'react';

interface SettingsContextType {
  isOpen: boolean;
  activeTab: string;
  openSettings: (tab?: string) => void;
  closeSettings: () => void;
  setActiveTab: (tab: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('api');

  // Sync with URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const settingsTab = urlParams.get('settingsTab');
    
    if (settingsTab && ['api', 'notifications', 'promptTemplates'].includes(settingsTab)) {
      setActiveTab(settingsTab);
      setIsOpen(true);
    }
  }, []);

  // Update URL when tab changes
  useEffect(() => {
    if (isOpen) {
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.set('settingsTab', activeTab);
      const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [activeTab, isOpen]);

  const openSettings = (tab: string = 'api') => {
    setActiveTab(tab);
    setIsOpen(true);
  };

  const closeSettings = () => {
    setIsOpen(false);
    // Remove settings parameter from URL
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.delete('settingsTab');
    const newUrl = urlParams.toString() 
      ? `${window.location.pathname}?${urlParams.toString()}`
      : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  };

  const handleSetActiveTab = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <SettingsContext.Provider
      value={{
        isOpen,
        activeTab,
        openSettings,
        closeSettings,
        setActiveTab: handleSetActiveTab,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};