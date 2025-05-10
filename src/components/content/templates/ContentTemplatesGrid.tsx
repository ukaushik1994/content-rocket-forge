
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshButton } from '@/components/ui/refresh-button';
import { SerpAnalysisResult } from '@/types/serp';
import { 
  FileText, 
  ListChecks, 
  HelpCircle, 
  Layers,
  FileQuestion,
  Tag,
  Heading,
  Component
} from 'lucide-react';

interface ContentTemplatesGridProps {
  serpData: SerpAnalysisResult;
  onGenerateContent: (template: string) => void;
  mainKeyword: string;
  onRefreshSection: (section: 'keywords' | 'headings' | 'questions' | 'entities') => void;
  isRefreshingKeywords: boolean;
  isRefreshingHeadings: boolean;
  isRefreshingQuestions: boolean;
  isRefreshingEntities: boolean;
}

export function ContentTemplatesGrid({ 
  serpData, 
  onGenerateContent,
  mainKeyword,
  onRefreshSection,
  isRefreshingKeywords,
  isRefreshingHeadings,
  isRefreshingQuestions,
  isRefreshingEntities
}: ContentTemplatesGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {/* Guide Template */}
      <Card className="border-neon-purple/20 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-2">
              <div className="p-2 bg-neon-purple/20 rounded-full">
                <FileText className="h-4 w-4 text-neon-purple" />
              </div>
              <div>
                <CardTitle className="text-base text-white/90">Comprehensive Guide</CardTitle>
                <p className="text-xs text-white/60">Complete educational content</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-neon-purple/20 text-neon-purple border-neon-purple/30">Guide</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          <p className="text-sm text-white/70">In-depth guide about {mainKeyword} with complete sections covering all aspects.</p>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {serpData.headings?.slice(0, 3).map((heading, idx) => (
              <Badge key={idx} variant="outline" className="text-xs bg-white/5 border-white/20">
                {heading.text}
              </Badge>
            ))}
            {serpData.headings && serpData.headings.length > 3 && (
              <Badge variant="outline" className="text-xs bg-white/5 border-white/20">
                +{serpData.headings.length - 3} more
              </Badge>
            )}
          </div>

          <div className="flex justify-between items-center mt-4">
            <p className="text-xs text-white/50">~2,500 words</p>
            <RefreshButton 
              isRefreshing={isRefreshingHeadings} 
              onClick={() => onRefreshSection('headings')}
              size="sm"
              className="h-7"
            >
              Refresh Headings
            </RefreshButton>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <Button 
            onClick={() => onGenerateContent('guide')} 
            className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
          >
            Generate Guide
          </Button>
        </CardFooter>
      </Card>
      
      {/* List Article Template */}
      <Card className="border-neon-blue/20 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-2">
              <div className="p-2 bg-neon-blue/20 rounded-full">
                <ListChecks className="h-4 w-4 text-neon-blue" />
              </div>
              <div>
                <CardTitle className="text-base text-white/90">List Article</CardTitle>
                <p className="text-xs text-white/60">Scannable list format</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-neon-blue/20 text-neon-blue border-neon-blue/30">List</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          <p className="text-sm text-white/70">Organized list of top {mainKeyword} items, tips, or resources with detailed explanations.</p>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {serpData.keywords?.slice(0, 3).map((keyword, idx) => (
              <Badge key={idx} variant="outline" className="text-xs bg-white/5 border-white/20">
                {keyword}
              </Badge>
            ))}
            {serpData.keywords && serpData.keywords.length > 3 && (
              <Badge variant="outline" className="text-xs bg-white/5 border-white/20">
                +{serpData.keywords.length - 3} more
              </Badge>
            )}
          </div>

          <div className="flex justify-between items-center mt-4">
            <p className="text-xs text-white/50">~1,800 words</p>
            <RefreshButton 
              isRefreshing={isRefreshingKeywords} 
              onClick={() => onRefreshSection('keywords')}
              size="sm"
              className="h-7"
            >
              Refresh Keywords
            </RefreshButton>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <Button 
            onClick={() => onGenerateContent('list')} 
            className="w-full bg-gradient-to-r from-neon-blue to-blue-500 hover:from-blue-500 hover:to-neon-blue"
          >
            Generate List Article
          </Button>
        </CardFooter>
      </Card>
      
      {/* FAQ Article Template */}
      <Card className="border-amber-500/20 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-2">
              <div className="p-2 bg-amber-500/20 rounded-full">
                <HelpCircle className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <CardTitle className="text-base text-white/90">FAQ Article</CardTitle>
                <p className="text-xs text-white/60">Question-based content</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-amber-500/20 text-amber-500 border-amber-500/30">FAQ</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          <p className="text-sm text-white/70">Comprehensive FAQ covering common questions about {mainKeyword} with detailed answers.</p>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {serpData.peopleAlsoAsk?.slice(0, 2).map((question, idx) => (
              <Badge key={idx} variant="outline" className="text-xs bg-white/5 border-white/20">
                {question.question.length > 30 ? question.question.substring(0, 30) + '...' : question.question}
              </Badge>
            ))}
            {serpData.peopleAlsoAsk && serpData.peopleAlsoAsk.length > 2 && (
              <Badge variant="outline" className="text-xs bg-white/5 border-white/20">
                +{serpData.peopleAlsoAsk.length - 2} more
              </Badge>
            )}
          </div>

          <div className="flex justify-between items-center mt-4">
            <p className="text-xs text-white/50">~2,000 words</p>
            <RefreshButton 
              isRefreshing={isRefreshingQuestions} 
              onClick={() => onRefreshSection('questions')}
              size="sm"
              className="h-7"
            >
              Refresh Questions
            </RefreshButton>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <Button 
            onClick={() => onGenerateContent('faq')} 
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-yellow-500 hover:to-amber-500"
          >
            Generate FAQ Article
          </Button>
        </CardFooter>
      </Card>
      
      {/* Comparison Article */}
      <Card className="border-green-500/20 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-2">
              <div className="p-2 bg-green-500/20 rounded-full">
                <Layers className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <CardTitle className="text-base text-white/90">Comparison Article</CardTitle>
                <p className="text-xs text-white/60">Side-by-side analysis</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/30">Compare</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          <p className="text-sm text-white/70">Detailed comparison of different approaches, solutions, or products related to {mainKeyword}.</p>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {serpData.entities?.slice(0, 3).map((entity, idx) => (
              <Badge key={idx} variant="outline" className="text-xs bg-white/5 border-white/20">
                {entity.name}
              </Badge>
            ))}
            {serpData.entities && serpData.entities.length > 3 && (
              <Badge variant="outline" className="text-xs bg-white/5 border-white/20">
                +{serpData.entities.length - 3} more
              </Badge>
            )}
          </div>

          <div className="flex justify-between items-center mt-4">
            <p className="text-xs text-white/50">~2,200 words</p>
            <RefreshButton 
              isRefreshing={isRefreshingEntities} 
              onClick={() => onRefreshSection('entities')}
              size="sm"
              className="h-7"
            >
              Refresh Entities
            </RefreshButton>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <Button 
            onClick={() => onGenerateContent('comparison')} 
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-emerald-500 hover:to-green-500"
          >
            Generate Comparison
          </Button>
        </CardFooter>
      </Card>
      
      {/* Tutorial Template */}
      <Card className="border-indigo-500/20 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-2">
              <div className="p-2 bg-indigo-500/20 rounded-full">
                <Component className="h-4 w-4 text-indigo-500" />
              </div>
              <div>
                <CardTitle className="text-base text-white/90">Tutorial</CardTitle>
                <p className="text-xs text-white/60">Step-by-step guide</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-indigo-500/20 text-indigo-500 border-indigo-500/30">How-to</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          <p className="text-sm text-white/70">Detailed tutorial teaching readers how to implement or use {mainKeyword} with clear steps.</p>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {serpData.headings?.slice(0, 2).map((heading, idx) => (
              <Badge key={idx} variant="outline" className="text-xs bg-white/5 border-white/20">
                {heading.text}
              </Badge>
            ))}
            {serpData.keywords?.slice(0, 1).map((keyword, idx) => (
              <Badge key={`kw-${idx}`} variant="outline" className="text-xs bg-white/5 border-white/20">
                {keyword}
              </Badge>
            ))}
          </div>

          <div className="flex justify-between items-center mt-4">
            <p className="text-xs text-white/50">~1,800 words</p>
            <RefreshButton 
              isRefreshing={isRefreshingHeadings} 
              onClick={() => onRefreshSection('headings')}
              size="sm"
              className="h-7"
            >
              Refresh Headings
            </RefreshButton>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <Button 
            onClick={() => onGenerateContent('tutorial')} 
            className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-violet-500 hover:to-indigo-500"
          >
            Generate Tutorial
          </Button>
        </CardFooter>
      </Card>
      
      {/* Q&A Analysis Template */}
      <Card className="border-rose-500/20 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-2">
              <div className="p-2 bg-rose-500/20 rounded-full">
                <FileQuestion className="h-4 w-4 text-rose-500" />
              </div>
              <div>
                <CardTitle className="text-base text-white/90">Expert Analysis</CardTitle>
                <p className="text-xs text-white/60">In-depth expert answers</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-rose-500/20 text-rose-500 border-rose-500/30">Analysis</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          <p className="text-sm text-white/70">Expert analysis providing authoritative answers on complex aspects of {mainKeyword}.</p>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {serpData.peopleAlsoAsk?.slice(0, 1).map((question, idx) => (
              <Badge key={idx} variant="outline" className="text-xs bg-white/5 border-white/20">
                {question.question.length > 30 ? question.question.substring(0, 30) + '...' : question.question}
              </Badge>
            ))}
            {serpData.entities?.slice(0, 2).map((entity, idx) => (
              <Badge key={`ent-${idx}`} variant="outline" className="text-xs bg-white/5 border-white/20">
                {entity.name}
              </Badge>
            ))}
          </div>

          <div className="flex justify-between items-center mt-4">
            <p className="text-xs text-white/50">~3,000 words</p>
            <RefreshButton 
              isRefreshing={isRefreshingQuestions} 
              onClick={() => onRefreshSection('questions')}
              size="sm"
              className="h-7"
            >
              Refresh Questions
            </RefreshButton>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <Button 
            onClick={() => onGenerateContent('analysis')} 
            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-pink-500 hover:to-rose-500"
          >
            Generate Analysis
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
