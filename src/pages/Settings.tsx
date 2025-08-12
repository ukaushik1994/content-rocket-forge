import React from 'react';
// Fix import: MinimalAPISettings is a default export
import MinimalAPISettings from '@/components/settings/MinimalAPISettings';

const Settings = () => {
  return (
    <div>
      <h1>Settings</h1>
      <MinimalAPISettings />
    </div>
  );
};

export default Settings;
