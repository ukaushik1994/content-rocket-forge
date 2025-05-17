
// Content format types definition
export const contentFormatTypes = [
  { value: 'blog', label: 'Blog Post' },
  { value: 'social-twitter', label: 'Twitter/X Post' },
  { value: 'social-linkedin', label: 'LinkedIn Post' },
  { value: 'social-facebook', label: 'Facebook Post' },
  { value: 'social-instagram', label: 'Instagram Caption' },
  { value: 'script', label: 'Video/Podcast Script' },
  { value: 'email', label: 'Email Newsletter' },
  { value: 'infographic', label: 'Infographic Content' },
  { value: 'glossary', label: 'Glossary Entry' },
  { value: 'case-study', label: 'Case Study' },
  { value: 'product-description', label: 'Product Description' },
  { value: 'white-paper', label: 'White Paper' },
  { value: 'press-release', label: 'Press Release' },
  { value: 'carousel', label: 'Carousel Post' },
  { value: 'meme', label: 'Meme Template' },
  { value: 'custom', label: 'Custom Format' },
];

// Helper function to get format type label
export const getFormatTypeLabel = (formatType: string) => {
  const format = contentFormatTypes.find(f => f.value === formatType);
  return format ? format.label : formatType;
};
