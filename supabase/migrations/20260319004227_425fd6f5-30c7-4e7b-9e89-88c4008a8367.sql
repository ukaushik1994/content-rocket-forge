-- One-time cleanup: delete all chat data to start fresh
DELETE FROM ai_message_reactions;
DELETE FROM ai_messages;
DELETE FROM ai_conversations;