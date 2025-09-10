import { toast } from 'sonner';
import AIServiceController from './AIServiceController';

/**
 * Test all configured AI providers and update their status
 */
export async function testAllProviders(): Promise<void> {
  try {
    console.log('🧪 Testing all configured AI providers...');
    
    // Clear cache to get fresh data
    AIServiceController.clearCache();
    
    // Get all providers (this includes both configured and unconfigured)
    const allProviders = await AIServiceController.getAllProviders();
    const configuredProviders = allProviders.filter(p => p.is_configured);
    
    if (configuredProviders.length === 0) {
      toast.info('No AI providers configured to test');
      return;
    }
    
    console.log(`Testing ${configuredProviders.length} configured providers...`);
    toast.loading(`Testing ${configuredProviders.length} AI provider${configuredProviders.length > 1 ? 's' : ''}...`);
    
    const testResults = [];
    
    // Test each provider
    for (const provider of configuredProviders) {
      try {
        console.log(`🔍 Testing ${provider.name}...`);
        const isWorking = await AIServiceController.testProvider(provider.id);
        testResults.push({
          name: provider.name,
          provider: provider.id,
          success: isWorking
        });
      } catch (error: any) {
        console.error(`❌ Error testing ${provider.name}:`, error);
        testResults.push({
          name: provider.name,
          provider: provider.id,
          success: false,
          error: error.message
        });
      }
    }
    
    // Report results
    const successCount = testResults.filter(r => r.success).length;
    const failureCount = testResults.filter(r => !r.success).length;
    
    console.log('🏁 Test Results:', testResults);
    
    if (successCount === configuredProviders.length) {
      toast.success(`All ${successCount} AI provider${successCount > 1 ? 's' : ''} working correctly!`);
    } else if (successCount > 0) {
      toast.warning(`${successCount}/${configuredProviders.length} AI providers working. Check settings for issues.`);
    } else {
      toast.error(`All ${failureCount} AI providers failed testing. Check API keys and network connection.`);
    }
    
    // Clear cache again to refresh UI
    AIServiceController.clearCache();
    
  } catch (error: any) {
    console.error('💥 Error during provider testing:', error);
    toast.error('Failed to test AI providers: ' + error.message);
  }
}

/**
 * Quick test function for a single provider
 */
export async function testSingleProvider(providerId: string): Promise<boolean> {
  try {
    console.log(`🧪 Testing single provider: ${providerId}`);
    const result = await AIServiceController.testProvider(providerId);
    console.log(`✅ ${providerId} test result:`, result);
    return result;
  } catch (error: any) {
    console.error(`❌ ${providerId} test failed:`, error);
    return false;
  }
}