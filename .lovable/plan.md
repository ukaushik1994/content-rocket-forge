

# Remove Quick Action Chips from Welcome Screen

## What
Delete the 4 quick action chip buttons (Write content, Run a campaign, Draft an email, What can you do?) from the AI Chat welcome state. Keep the Platform Summary metrics and the Insights section.

## Changes — 1 file

### `src/components/ai-chat/EnhancedChatInterface.tsx` (lines 802-833)
Delete the entire "Quick Action Chips" `motion.div` block — the array of 4 buttons and their wrapper.

### Files changed: 1

