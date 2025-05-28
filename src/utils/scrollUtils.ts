
/**
 * Utility functions for smooth scrolling and element navigation
 */

export const scrollToElement = (elementId: string, offset: number = 0) => {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
    return true;
  }
  return false;
};

export const scrollToHeadingInContent = (headingText: string, containerSelector: string = '.content-container') => {
  const container = document.querySelector(containerSelector);
  if (!container) return false;
  
  // Find the heading element that contains this text
  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
  for (const heading of headings) {
    if (heading.textContent?.trim() === headingText) {
      heading.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
      return true;
    }
  }
  return false;
};

export const generateHeadingId = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
};
