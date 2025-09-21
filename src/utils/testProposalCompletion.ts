/**
 * Test script for proposal completion system
 * Run this in the browser console to test the complete workflow
 */
import { recoverExistingProposals } from './manualProposalRecovery';

// Make the function available globally for console testing
(window as any).testProposalSystem = {
  recoverExistingProposals,
  
  // Instructions for testing
  instructions: `
    To test the proposal completion system:
    
    1. Run: await testProposalSystem.recoverExistingProposals()
       This will fix existing content and mark proposals as completed.
    
    2. Check the content strategy page - you should see proposals marked as completed.
    
    3. Create new content from an available proposal to test automatic completion.
  `
};

console.log('Proposal completion test utilities loaded. Run:');
console.log('console.log(testProposalSystem.instructions) for usage instructions');