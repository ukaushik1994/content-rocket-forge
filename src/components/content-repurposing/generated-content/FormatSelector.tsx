
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getFormatByIdOrDefault, 
  formatCategories, 
  FormatCategory,
  getCategoryColor
} from '../formats';
import FormatButton from './FormatButton';

interface FormatSelectorProps {
  generatedFormats: string[];
  formatsByCategory: Record<FormatCategory, string[]>;
  categoriesWithContent: FormatCategory[];
  activeFormat: string | null;
  setActiveFormat: (format: string) => void;
}

const FormatSelector: React.FC<FormatSelectorProps> = ({ 
  generatedFormats, 
  formatsByCategory,
  categoriesWithContent,
  activeFormat, 
  setActiveFormat 
}) => {
  const [activeCategory, setActiveCategory] = useState<FormatCategory>(
    categoriesWithContent.length > 0 ? categoriesWithContent[0] : 'social'
  );

  if (generatedFormats.length === 0) return null;
  
  // Find the category of the active format if there is one
  React.useEffect(() => {
    if (activeFormat) {
      const format = getFormatByIdOrDefault(activeFormat);
      if (categoriesWithContent.includes(format.category)) {
        setActiveCategory(format.category);
      }
    }
  }, [activeFormat, categoriesWithContent]);

  return (
    <div className="space-y-3">
      <Tabs 
        value={activeCategory}
        onValueChange={(value) => setActiveCategory(value as FormatCategory)}
        className="w-full"
      >
        <TabsList className="w-full bg-black/20 p-1 border border-white/10 rounded-lg">
          {categoriesWithContent.map((category) => {
            const categoryInfo = formatCategories[category];
            const count = formatsByCategory[category].length;
            const colorClass = getCategoryColor(category);
            
            return (
              <TabsTrigger
                key={category}
                value={category}
                className={`relative data-[state=active]:bg-gradient-to-r data-[state=active]:shadow-none text-xs py-1.5 min-w-20 data-[state=active]:text-white`}
                style={{
                  backgroundImage: activeCategory === category ? 
                    `linear-gradient(to right, var(--tw-gradient-stops))` : 'none'
                }}
                data-color={activeCategory === category ? colorClass : ''}
              >
                {activeCategory === category && (
                  <motion.div
                    layoutId="activeCategoryBackground"
                    className={`absolute inset-0 rounded-md bg-gradient-to-r ${colorClass} -z-10`}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">
                  {categoryInfo.name} ({count})
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>
        
        <AnimatePresence mode="wait">
          {categoriesWithContent.map((category) => (
            <TabsContent key={category} value={category} className="mt-2">
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3 }}
                className="flex flex-wrap gap-2 pb-1"
              >
                {formatsByCategory[category].map((formatId) => {
                  const format = getFormatByIdOrDefault(formatId);
                  return (
                    <FormatButton
                      key={formatId}
                      formatId={formatId}
                      name={format.name}
                      isActive={activeFormat === formatId}
                      onClick={() => setActiveFormat(formatId)}
                      category={format.category}
                    />
                  );
                })}
              </motion.div>
            </TabsContent>
          ))}
        </AnimatePresence>
      </Tabs>
    </div>
  );
};

export default FormatSelector;
