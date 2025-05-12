
import { supabase } from '@/integrations/supabase/client';
import { SerpAnalysisResult, SerpSearchParams } from '@/types/serp';

interface SearchKeywordParams {
  query: string;
  limit?: number;
  refresh?: boolean;
  countries?: string[];
}

export type { SerpAnalysisResult }; // Properly re-export the type with 'export type'

export const searchKeywords = async (params: SearchKeywordParams) => {
  try {
    const { query, limit = 10, refresh = false, countries = ['us'] } = params;
    
    // Get the SERP API key from the user's settings
    const { data: apiKey } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('service', 'serp')
      .eq('is_active', true)
      .single();

    if (!apiKey) {
      console.error('No SERP API key found in settings');
      return [];
    }
    
    // Add a cache-busting parameter if refresh is true
    const cacheBuster = refresh ? `&_cb=${Date.now()}` : '';
    
    // Generate results for each country
    const allResults = await Promise.all(countries.map(async (country) => {
      // In a real implementation, this would make API calls with country-specific parameters
      
      // Mock data for development - in production, this would call the actual API with country parameter
      const mockResults = [
        { title: `${country.toUpperCase()}: How to Use ${query} Effectively`, url: `https://example.com/${country}/1` },
        { title: `${country.toUpperCase()}: The Ultimate Guide to ${query}`, url: `https://example.com/${country}/2` },
        { title: `${country.toUpperCase()}: 10 Best ${query} Strategies`, url: `https://example.com/${country}/3` },
        { title: `${country.toUpperCase()}: Why ${query} Matters for SEO`, url: `https://example.com/${country}/4` },
        { title: `${country.toUpperCase()}: Understanding ${query} for Beginners`, url: `https://example.com/${country}/5` },
        { title: `${country.toUpperCase()}: ${query} vs Traditional Methods`, url: `https://example.com/${country}/6` },
        { title: `${country.toUpperCase()}: The Future of ${query} in 2025`, url: `https://example.com/${country}/7` },
        { title: `${country.toUpperCase()}: How to Measure ${query} Success`, url: `https://example.com/${country}/8` },
        { title: `${country.toUpperCase()}: ${query} Best Practices`, url: `https://example.com/${country}/9` },
        { title: `${country.toUpperCase()}: ${query} Case Studies`, url: `https://example.com/${country}/10` },
      ];
      
      // If refreshing, shuffle the results to simulate new data
      if (refresh) {
        return {
          country,
          results: mockResults
            .map(item => ({ 
              ...item, 
              title: item.title.replace(query, `${query} ${['Expert', 'Professional', 'Advanced', 'Strategic'][Math.floor(Math.random() * 4)]}`)
            }))
            .sort(() => Math.random() - 0.5)
        };
      }
      
      return { country, results: mockResults };
    }));
    
    // Flatten results and take top items
    const combinedResults = allResults.flatMap(countryData => 
      countryData.results.map(result => ({
        ...result,
        country: countryData.country
      }))
    );
    
    return combinedResults.slice(0, limit);
  } catch (error) {
    console.error('Error searching keywords:', error);
    return [];
  }
};

export const analyzeKeywordSerp = async (keyword: string, refresh?: boolean, countries: string[] = ['us']): Promise<SerpAnalysisResult> => {
  try {
    // Get the SERP API key from the user's settings
    const { data: apiKey } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('service', 'serp')
      .eq('is_active', true)
      .single();

    if (!apiKey) {
      console.warn('No SERP API key found in settings, using mock data');
      // Return mock data instead of null for testing
      return generateMockSerpData(keyword, refresh, countries);
    }
    
    // Mock data for now - in production, this would call the actual API
    return generateMockSerpData(keyword, refresh, countries);
  } catch (error) {
    console.error('Error analyzing keyword:', error);
    return generateMockSerpData(keyword, refresh, countries);
  }
};

// Helper function to generate mock SERP data
function generateMockSerpData(keyword: string, refresh?: boolean, countries: string[] = ['us']): SerpAnalysisResult {
  // Create variations based on refresh parameter
  const variationFactor = refresh ? Math.random() : 0.5;
  
  // Ensure we always include UK, US, MEA, and global data
  const standardRegions = ['uk', 'us', 'mea'];
  const regionsToInclude = Array.from(new Set([...standardRegions, ...countries]));
  
  // Create a set to store unique values to prevent duplicates
  const uniqueKeywords = new Set<string>();
  const uniqueQuestions = new Set<string>();
  const uniqueHeadings = new Set<string>();
  const uniqueRelatedSearches = new Set<string>();
  const uniqueEntities = new Set<string>();
  const uniqueContentGaps = new Set<string>();
  
  // Add region-specific data
  regionsToInclude.forEach((region) => {
    // Format the region label
    const regionLabel = region.toLowerCase() === 'mea' ? 'MEA' : region.toUpperCase();
    
    // Add region-specific keywords
    [`${regionLabel}: ${keyword} strategy`, 
     `${regionLabel}: ${keyword} tools`, 
     `${regionLabel}: best ${keyword} practices`, 
     `${regionLabel}: ${keyword} guide`,
     `${regionLabel}: ${keyword} tutorial`,
     `${regionLabel}: ${keyword} examples`,
     `${regionLabel}: ${keyword} techniques`,
     `${regionLabel}: ${keyword} trends`].forEach(kw => uniqueKeywords.add(kw));
    
    // Add region-specific questions
    [`${regionLabel}: How does ${keyword} work in ${regionLabel}?`,
     `${regionLabel}: What is the best ${keyword} tool in ${regionLabel}?`,
     `${regionLabel}: Why is ${keyword} important for SEO in ${regionLabel}?`,
     `${regionLabel}: When should I use ${keyword} in ${regionLabel}?`].forEach(q => uniqueQuestions.add(q));
    
    // Add region-specific headings
    [`${regionLabel}: Understanding ${keyword} in ${regionLabel}`,
     `${regionLabel}: Benefits of ${keyword} for ${regionLabel} markets`,
     `${regionLabel}: How to Implement ${keyword} in ${regionLabel}`,
     `${regionLabel}: ${keyword} Best Practices for ${regionLabel}`].forEach(h => uniqueHeadings.add(h));
    
    // Add region-specific related searches
    [`${regionLabel}: ${keyword} strategy`,
     `${regionLabel}: ${keyword} tools`,
     `${regionLabel}: best ${keyword} practices in ${regionLabel}`,
     `${regionLabel}: ${keyword} guide`].forEach(rs => uniqueRelatedSearches.add(rs));
     
    // Add region-specific entities
    [`${regionLabel}: ${keyword} platform`,
     `${regionLabel}: ${keyword} strategy`,
     `${regionLabel}: ${keyword} tools`,
     `${regionLabel}: ${keyword} metrics`].forEach(e => uniqueEntities.add(e));

    // Add region-specific content gaps
    [`${regionLabel}: ${keyword} for beginners in ${regionLabel}`,
     `${regionLabel}: Advanced ${keyword} techniques for ${regionLabel}`,
     `${regionLabel}: ${keyword} ROI measurement in ${regionLabel}`,
     `${regionLabel}: ${keyword} vs competitors in ${regionLabel}`].forEach(cg => uniqueContentGaps.add(cg));
  });
  
  // Add global keywords that are relevant across regions
  [`Global: ${keyword} strategy`,
   `Global: international ${keyword} tools`,
   `Global: universal ${keyword} practices`,
   `Global: worldwide ${keyword} trends`].forEach(kw => uniqueKeywords.add(kw));
   
  // Add global questions
  [`Global: How does ${keyword} work globally?`,
   `Global: What are the best ${keyword} practices worldwide?`,
   `Global: Why is ${keyword} important for international SEO?`,
   `Global: When should I implement ${keyword} across markets?`].forEach(q => uniqueQuestions.add(q));

  // Add global headings
  [`Global: Global approach to ${keyword}`,
   `Global: International ${keyword} implementation`,
   `Global: Universal benefits of ${keyword}`,
   `Global: Cross-market ${keyword} strategies`].forEach(h => uniqueHeadings.add(h));
   
  // Add global entities
  [`Global: ${keyword} global platform`,
   `Global: international ${keyword} framework`,
   `Global: cross-market ${keyword} methodology`,
   `Global: universal ${keyword} metrics`].forEach(e => uniqueEntities.add(e));
   
  // Add global content gaps
  [`Global: ${keyword} for global markets`,
   `Global: International ${keyword} best practices`,
   `Global: Cross-border ${keyword} implementation`,
   `Global: Multilingual ${keyword} strategies`].forEach(cg => uniqueContentGaps.add(cg));
   
  // Add refresh-specific items if needed
  if (refresh) {
    regionsToInclude.forEach(region => {
      const regionLabel = region.toLowerCase() === 'mea' ? 'MEA' : region.toUpperCase();
      
      [`${regionLabel}: ${keyword} certification`,
       `${regionLabel}: ${keyword} for startups`,
       `${regionLabel}: ${keyword} ROI`,
       `${regionLabel}: ${keyword} software comparison`].forEach(kw => uniqueKeywords.add(kw));
       
      [`${regionLabel}: What are the advantages of ${keyword} in ${regionLabel}?`,
       `${regionLabel}: How much does ${keyword} cost on average in ${regionLabel}?`,
       `${regionLabel}: Can ${keyword} be integrated with other systems in ${regionLabel}?`].forEach(q => uniqueQuestions.add(q));
       
      [`${regionLabel}: Cost analysis of ${keyword} in ${regionLabel}`,
       `${regionLabel}: ${keyword} integration options for ${regionLabel}`,
       `${regionLabel}: Future of ${keyword} in ${regionLabel} market`].forEach(h => uniqueHeadings.add(h));
       
      [`${regionLabel}: ${keyword} pricing model`,
       `${regionLabel}: ${keyword} certification authority`,
       `${regionLabel}: ${keyword} compliance in ${regionLabel}`].forEach(e => uniqueEntities.add(e));
       
      [`${regionLabel}: ${keyword} cost optimization in ${regionLabel}`,
       `${regionLabel}: ${keyword} compliance requirements for ${regionLabel}`,
       `${regionLabel}: ${keyword} implementation case studies in ${regionLabel}`].forEach(cg => uniqueContentGaps.add(cg));
    });
  }
  
  // Create an array to store region-specific top results
  const topResultsByRegion: Array<{
    title: string;
    link: string;
    snippet: string;
    position: number;
    country: string;
  }> = [];

  // Generate top results for each region
  regionsToInclude.forEach((region, regionIndex) => {
    const regionLabel = region.toLowerCase() === 'mea' ? 'MEA' : region.toUpperCase();
    
    // Generate 3 results per region
    for (let i = 1; i <= 3; i++) {
      topResultsByRegion.push({
        title: `${regionLabel}: The ${i === 1 ? 'Ultimate Guide' : i === 2 ? 'Complete Manual' : 'Expert Roadmap'} to ${keyword} in ${regionLabel}`,
        link: `https://example.com/${region.toLowerCase()}/${keyword.replace(/\s+/g, '-')}-guide-${i}`,
        snippet: `Comprehensive ${regionLabel} resource about ${keyword} with region-specific insights and strategies for ${regionLabel} markets.`,
        position: regionIndex * 3 + i,
        country: region.toLowerCase()
      });
    }
  });

  // Add some global results
  topResultsByRegion.push({
    title: `Global: Universal ${keyword} Best Practices`,
    link: `https://example.com/global/${keyword.replace(/\s+/g, '-')}-practices`,
    snippet: `International standards and best practices for ${keyword} implementation across all markets.`,
    position: regionsToInclude.length * 3 + 1,
    country: 'global'
  });
  
  topResultsByRegion.push({
    title: `Global: Cross-Regional ${keyword} Implementation Guide`,
    link: `https://example.com/global/${keyword.replace(/\s+/g, '-')}-cross-regional`,
    snippet: `Learn how to adapt ${keyword} strategies across UK, US, and MEA markets.`,
    position: regionsToInclude.length * 3 + 2,
    country: 'global'
  });
  
  // Generate mock data based on the keyword with potential variations
  return {
    keyword,
    searchVolume: Math.floor(Math.random() * 10000) + 1000,
    competitionScore: Math.random() * 0.8,
    keywordDifficulty: Math.floor(Math.random() * 100),
    entities: Array.from(uniqueEntities).map(name => ({ name, type: 'entity' })),
    peopleAlsoAsk: Array.from(uniqueQuestions).map(question => ({ question, source: 'search' })),
    headings: Array.from(uniqueHeadings).map(text => ({ text, level: 'h2' as const })),
    contentGaps: Array.from(uniqueContentGaps).map(topic => ({ 
      topic, 
      description: `Content opportunity for ${topic}`, 
      recommendation: `Create comprehensive content about ${topic}` 
    })),
    topResults: topResultsByRegion,
    relatedSearches: Array.from(uniqueRelatedSearches).map(query => ({ query })),
    keywords: Array.from(uniqueKeywords),
    recommendations: [
      `Create a comprehensive guide on ${keyword}`,
      `Include step-by-step instructions for implementing ${keyword}`,
      `Add visual examples of ${keyword} in action`,
      `Compare ${keyword} with alternative approaches`,
      `Include case studies showing successful ${keyword} implementation`,
      ...regionsToInclude.map(region => {
        const regionLabel = region.toLowerCase() === 'mea' ? 'MEA' : region.toUpperCase();
        return `Create localized content for ${regionLabel} market`;
      }),
      `Develop a global strategy that works across all regions`
    ],
    isMockData: true,
    searchCountries: countries  // Property explicitly added to match type
  };
}

export const searchRelatedKeywords = async (keyword: string, countries: string[] = ['us']) => {
  try {
    const uniqueKeywords = new Set<string>();
    
    // Ensure we include UK, US, MEA regions
    const standardRegions = ['uk', 'us', 'mea'];
    const regionsToInclude = Array.from(new Set([...standardRegions, ...countries]));
    
    // Generate region-specific related keywords
    regionsToInclude.forEach(region => {
      const regionLabel = region.toLowerCase() === 'mea' ? 'MEA' : region.toUpperCase();
      
      [`${regionLabel}: ${keyword} strategy`,
       `${regionLabel}: ${keyword} tools`,
       `${regionLabel}: best ${keyword} practices in ${region}`,
       `${regionLabel}: ${keyword} guide`,
       `${regionLabel}: ${keyword} tutorial`,
       `${regionLabel}: ${keyword} examples`,
       `${regionLabel}: ${keyword} techniques`,
       `${regionLabel}: ${keyword} trends`].forEach(kw => uniqueKeywords.add(kw));
    });
    
    // Add some global keywords
    [`Global: ${keyword} worldwide strategy`,
     `Global: international ${keyword} approach`,
     `Global: cross-market ${keyword} implementation`].forEach(kw => uniqueKeywords.add(kw));
    
    return Array.from(uniqueKeywords);
  } catch (error) {
    console.error('Error searching related keywords:', error);
    return [];
  }
};
