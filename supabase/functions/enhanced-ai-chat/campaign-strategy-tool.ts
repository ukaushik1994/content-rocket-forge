// Campaign Strategy Generation Tool Definition
// Uses function calling for reliable structured output

export const CAMPAIGN_STRATEGY_TOOL = {
  type: "function",
  function: {
    name: "generate_campaign_strategies",
    description: "Generate 3-4 specific B2B SaaS marketing campaign strategies based on user's campaign context",
    parameters: {
      type: "object",
      properties: {
        strategies: {
          type: "array",
          description: "Array of 3-4 distinct campaign strategies",
          minItems: 3,
          maxItems: 4,
          items: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description: "Unique UUID for this strategy"
              },
              title: {
                type: "string",
                description: "Specific campaign name format: [Audience] [Channel/Type]: [Solution Benefit]. Example: 'CFO LinkedIn: Finance Automation' or 'Startup Founders Email Series: Project Management Tips'"
              },
              description: {
                type: "string",
                description: "1-2 sentences explaining the tactical approach (not generic benefits)"
              },
              contentMix: {
                type: "array",
                description: "Array of content formats with counts",
                items: {
                  type: "object",
                  properties: {
                    formatId: {
                      type: "string",
                      enum: ["blog", "email", "social-linkedin", "social-twitter", "social-facebook", "social-instagram", "script", "landing-page", "carousel", "meme", "google-ads"],
                      description: "Content format ID"
                    },
                    count: {
                      type: "integer",
                      minimum: 1,
                      maximum: 20,
                      description: "Number of pieces for this format"
                    }
                  },
                  required: ["formatId", "count"]
                }
              },
              expectedOutcome: {
                type: "string",
                description: "1 specific sentence on what THIS campaign achieves for THIS solution"
              },
              focus: {
                type: "string",
                enum: ["awareness", "conversion", "engagement", "education"],
                description: "Primary campaign focus"
              },
              effortLevel: {
                type: "string",
                enum: ["low", "medium", "high"],
                description: "Overall effort required"
              },
              totalHours: {
                type: "integer",
                minimum: 5,
                maximum: 200,
                description: "Total hours needed. Calculate based on: blog=4hrs, email=2hrs, social=1hr, video/script=8hrs, landing-page=6hrs, carousel=3hrs, meme=0.5hrs, google-ads=2hrs"
              },
              complexity: {
                type: "string",
                enum: ["beginner", "skilled", "expert"],
                description: "Skill level required. Expert = video/paid ads, Skilled = blog/email/landing pages, Beginner = social media"
              },
              totalEffort: {
                type: "object",
                description: "Detailed effort breakdown with workflow order",
                properties: {
                  hours: { type: "integer", description: "Same as totalHours field" },
                  complexity: { type: "string", enum: ["beginner", "skilled", "expert"] },
                  workflowOrder: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "Recommended creation order (formatIds from contentMix)"
                  }
                }
              },
              audienceIntelligence: {
                type: "object",
                description: "Target audience insights based on campaign context",
                properties: {
                  personas: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "3-4 buyer personas (e.g., 'CFO at Mid-Market SaaS')"
                  },
                  industrySegments: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "2-3 target industries"
                  },
                  painPoints: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "3-5 specific pain points this campaign addresses"
                  },
                  messagingAngle: { 
                    type: "string",
                    description: "1 sentence describing the core messaging approach"
                  }
                }
              },
              seoIntelligence: {
                type: "object",
                description: "SEO insights for content optimization",
                properties: {
                  primaryKeyword: { type: "string", description: "Main keyword focus" },
                  secondaryKeywords: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "5-8 related keywords"
                  },
                  avgRankingDifficulty: { 
                    type: "string", 
                    enum: ["low", "medium", "high"],
                    description: "Overall keyword difficulty"
                  },
                  expectedSeoImpact: { 
                    type: "string",
                    description: "Expected impact (e.g., 'High organic visibility', 'Moderate search traffic')"
                  },
                  briefTemplatesAvailable: { 
                    type: "integer",
                    description: "Number of content briefs (equals total content pieces from contentMix)"
                  }
                }
              },
              distributionStrategy: {
                type: "object",
                description: "Content distribution and publishing plan",
                properties: {
                  channels: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "Distribution channels (e.g., 'LinkedIn', 'Email', 'Blog')"
                  },
                  postingCadence: { 
                    type: "string",
                    description: "Frequency (e.g., '3x per week', 'Daily')"
                  },
                  bestDaysAndTimes: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "Optimal posting times (e.g., 'Tue/Thu 10am EST')"
                  },
                  estimatedTrafficLift: { 
                    type: "string",
                    description: "Expected traffic increase (e.g., '+40% organic traffic')"
                  }
                }
              },
              assetRequirements: {
                type: "object",
                description: "Assets needed to execute this campaign",
                properties: {
                  copyNeeds: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "Copy requirements (e.g., 'Product descriptions', 'Case studies')"
                  },
                  visualNeeds: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "Visual/creative needs (e.g., 'Hero images', 'Infographics')"
                  },
                  ctaSuggestions: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "3-5 CTA variations (e.g., 'Start Free Trial', 'Book a Demo')"
                  }
                }
              },
              contentBriefs: {
                type: "array",
                description: "CRITICAL: Detailed brief for EVERY content piece in contentMix (ready for batch generation)",
                items: {
                  type: "object",
                  properties: {
                    formatId: { type: "string", description: "Content format ID matching contentMix" },
                    pieceIndex: { type: "number", description: "Index of this piece (0-based)" },
                    title: { type: "string", description: "Exact content title" },
                    description: { type: "string", description: "What this content covers" },
                    keywords: { type: "array", items: { type: "string" }, description: "5-8 target keywords" },
                    metaTitle: { type: "string", description: "SEO-optimized meta title" },
                    metaDescription: { type: "string", description: "SEO-optimized meta description" },
                    targetWordCount: { type: "number", description: "Target word count" },
                    difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
                    serpOpportunity: { type: "number", description: "0-100 ranking potential" },
                    ctaText: { type: "string", description: "Call-to-action text" },
                    publishDate: { type: "string", description: "Suggested publish date" },
                    utmParams: { type: "object", description: "UTM parameters for tracking" }
                  },
                  required: ["formatId", "pieceIndex", "title", "description", "keywords", "metaTitle", "metaDescription", "targetWordCount", "difficulty", "serpOpportunity"]
                }
              }
            },
            required: ["id", "title", "description", "contentMix", "expectedOutcome", "focus", "effortLevel", "totalHours", "complexity", "contentBriefs", "totalEffort", "audienceIntelligence", "seoIntelligence", "distributionStrategy", "assetRequirements"]
          }
        }
      },
      required: ["strategies"]
    }
  }
};
