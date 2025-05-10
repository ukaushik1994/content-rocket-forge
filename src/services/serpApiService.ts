
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
  
  // Create a set to store unique values to prevent duplicates
  const uniqueKeywords = new Set<string>();
  const uniqueQuestions = new Set<string>();
  const uniqueHeadings = new Set<string>();
  const uniqueRelatedSearches = new Set<string>();
  const uniqueEntities = new Set<string>();
  const uniqueContentGaps = new Set<string>();
  
  // Combine data from all selected countries
  countries.forEach((country) => {
    // Add country-specific keywords
    [`${country}: ${keyword} strategy`, 
     `${country}: ${keyword} tools`, 
     `${country}: best ${keyword} practices`, 
     `${country}: ${keyword} guide`,
     `${country}: ${keyword} tutorial`,
     `${country}: ${keyword} examples`,
     `${country}: ${keyword} techniques`,
     `${country}: ${keyword} trends`].forEach(kw => uniqueKeywords.add(kw));
    
    // Add country-specific questions
    [`${country}: How does ${keyword} work in ${country}?`,
     `${country}: What is the best ${keyword} tool in ${country}?`,
     `${country}: Why is ${keyword} important for SEO in ${country}?`,
     `${country}: When should I use ${keyword} in ${country}?`].forEach(q => uniqueQuestions.add(q));
    
    // Add country-specific headings
    [`${country}: Understanding ${keyword} in ${country}`,
     `${country}: Benefits of ${keyword} for ${country} markets`,
     `${country}: How to Implement ${keyword} in ${country}`,
     `${country}: ${keyword} Best Practices for ${country}`].forEach(h => uniqueHeadings.add(h));
    
    // Add country-specific related searches
    [`${country}: ${keyword} strategy`,
     `${country}: ${keyword} tools`,
     `${country}: best ${keyword} practices in ${country}`,
     `${country}: ${keyword} guide`].forEach(rs => uniqueRelatedSearches.add(rs));
     
    // Add country-specific entities
    [`${country}: ${keyword} platform`,
     `${country}: ${keyword} strategy`,
     `${country}: ${keyword} tools`,
     `${country}: ${keyword} metrics`].forEach(e => uniqueEntities.add(e));

    // Add country-specific content gaps
    [`${country}: ${keyword} for beginners in ${country}`,
     `${country}: Advanced ${keyword} techniques for ${country}`,
     `${country}: ${keyword} ROI measurement in ${country}`,
     `${country}: ${keyword} vs competitors in ${country}`].forEach(cg => uniqueContentGaps.add(cg));
  });
  
  // Add global keywords that are relevant across regions
  [`global ${keyword} strategy`,
   `international ${keyword} tools`,
   `universal ${keyword} practices`,
   `worldwide ${keyword} trends`].forEach(kw => uniqueKeywords.add(kw));
   
  // Add global questions
  [`How does ${keyword} work globally?`,
   `What are the best ${keyword} practices worldwide?`,
   `Why is ${keyword} important for international SEO?`,
   `When should I implement ${keyword} across markets?`].forEach(q => uniqueQuestions.add(q));

  // Add global headings
  [`Global approach to ${keyword}`,
   `International ${keyword} implementation`,
   `Universal benefits of ${keyword}`,
   `Cross-market ${keyword} strategies`].forEach(h => uniqueHeadings.add(h));
   
  // Add global entities
  [`${keyword} global platform`,
   `international ${keyword} framework`,
   `cross-market ${keyword} methodology`,
   `universal ${keyword} metrics`].forEach(e => uniqueEntities.add(e));
   
  // Add global content gaps
  [`${keyword} for global markets`,
   `International ${keyword} best practices`,
   `Cross-border ${keyword} implementation`,
   `Multilingual ${keyword} strategies`].forEach(cg => uniqueContentGaps.add(cg));
   
  // Add refresh-specific items if needed
  if (refresh) {
    countries.forEach(country => {
      [`${country}: ${keyword} certification`,
       `${country}: ${keyword} for startups`,
       `${country}: ${keyword} ROI`,
       `${country}: ${keyword} software comparison`].forEach(kw => uniqueKeywords.add(kw));
       
      [`${country}: What are the advantages of ${keyword} in ${country}?`,
       `${country}: How much does ${keyword} cost on average in ${country}?`,
       `${country}: Can ${keyword} be integrated with other systems in ${country}?`].forEach(q => uniqueQuestions.add(q));
       
      [`${country}: Cost analysis of ${keyword} in ${country}`,
       `${country}: ${keyword} integration options for ${country}`,
       `${country}: Future of ${keyword} in ${country} market`].forEach(h => uniqueHeadings.add(h));
       
      [`${country}: ${keyword} pricing model`,
       `${country}: ${keyword} certification authority`,
       `${country}: ${keyword} compliance in ${country}`].forEach(e => uniqueEntities.add(e));
       
      [`${country}: ${keyword} cost optimization in ${country}`,
       `${country}: ${keyword} compliance requirements for ${country}`,
       `${country}: ${keyword} implementation case studies in ${country}`].forEach(cg => uniqueContentGaps.add(cg));
    });
  }
  
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
    topResults: countries.flatMap((country, idx) => ([
      {
        title: `The Ultimate Guide to ${keyword} in ${country.toUpperCase()}`,
        link: `https://example.com/${country}/${keyword}-guide`,
        snippet: `Learn everything you need to know about ${keyword} with our comprehensive guide for ${country.toUpperCase()}.`,
        position: idx * 5 + 1,
        country
      },
      {
        title: `${country.toUpperCase()}: Best ${keyword} Practices in ${new Date().getFullYear()}`,
        link: `https://example.com/${country}/${keyword}-best-practices`,
        snippet: `Discover the most effective ${keyword} practices for ${country.toUpperCase()} markets in ${new Date().getFullYear()}.`,
        position: idx * 5 + 2,
        country
      },
      {
        title: `${country.toUpperCase()}: How to Implement ${keyword} Successfully`,
        link: `https://example.com/${country}/${keyword}-implementation`,
        snippet: `Step-by-step guide to successfully implementing ${keyword} strategies in ${country.toUpperCase()}.`,
        position: idx * 5 + 3,
        country
      }
    ])),
    relatedSearches: Array.from(uniqueRelatedSearches).map(query => ({ query })),
    keywords: Array.from(uniqueKeywords),
    recommendations: [
      `Create a comprehensive guide on ${keyword}`,
      `Include step-by-step instructions for implementing ${keyword}`,
      `Add visual examples of ${keyword} in action`,
      `Compare ${keyword} with alternative approaches`,
      `Include case studies showing successful ${keyword} implementation`,
      ...countries.map(country => `Create localized content for ${country.toUpperCase()} market`)
    ],
    isMockData: true,
    searchCountries: countries  // Property explicitly added to match type
  };
}

export const searchRelatedKeywords = async (keyword: string, countries: string[] = ['us']) => {
  try {
    const uniqueKeywords = new Set<string>();
    
    // Generate country-specific related keywords
    countries.forEach(country => {
      [`${country} ${keyword} strategy`,
       `${country} ${keyword} tools`,
       `best ${keyword} practices in ${country}`,
       `${country} ${keyword} guide`,
       `${country} ${keyword} tutorial`,
       `${country} ${keyword} examples`,
       `${country} ${keyword} techniques`,
       `${country} ${keyword} trends`].forEach(kw => uniqueKeywords.add(kw));
    });
    
    return Array.from(uniqueKeywords);
  } catch (error) {
    console.error('Error searching related keywords:', error);
    return [];
  }
};
