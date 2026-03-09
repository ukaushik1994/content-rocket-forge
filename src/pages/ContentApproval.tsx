
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ContentApprovalView } from '@/components/approval/ContentApprovalView';
import { ContentProvider } from '@/contexts/content';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { PageContainer } from '@/components/ui/PageContainer';

const ContentApproval = () => {
  return (
    <PageContainer className="w-full relative overflow-hidden">
      <AnimatedBackground intensity="medium" />
      
      <Helmet>
        <title>Content Approval | Creaiter</title>
        <meta name="description" content="Review and approve content submissions with advanced workflow management" />
      </Helmet>
      
      <main className="flex-1 container px-6 pt-24 pb-12 relative z-10">
        <ContentProvider>
          <ContentApprovalView />
        </ContentProvider>
      </main>
    </PageContainer>
  );
};

export default ContentApproval;

