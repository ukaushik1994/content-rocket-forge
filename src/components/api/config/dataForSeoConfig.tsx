
export const dataForSeoConfigOptions = [
  {
    id: 'rateLimit',
    label: 'Rate Limit (requests per minute)',
    type: 'slider' as const,
    value: 60,
    min: 10,
    max: 100,
    step: 5,
    description: 'Maximum number of API requests to make per minute'
  },
  {
    id: 'cacheResults',
    label: 'Cache Results',
    type: 'boolean' as const,
    value: true,
    description: 'Store API results in local cache to reduce API calls'
  },
  {
    id: 'defaultLocation',
    label: 'Default Location',
    type: 'select' as const,
    value: 'us',
    options: [
      { value: 'us', label: 'United States' },
      { value: 'uk', label: 'United Kingdom' },
      { value: 'ca', label: 'Canada' },
      { value: 'au', label: 'Australia' }
    ],
    description: 'Default location for SERP data'
  }
];
