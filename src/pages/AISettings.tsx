import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useSettings } from '@/contexts/SettingsContext';

const AISettings = () => {
  const { openSettings } = useSettings();

  useEffect(() => {
    openSettings('api');
  }, [openSettings]);

  return <Navigate to="/ai-chat" replace />;
};

export default AISettings;
