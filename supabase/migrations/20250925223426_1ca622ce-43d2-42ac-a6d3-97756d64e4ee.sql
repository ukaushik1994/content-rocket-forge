-- Remove A/B testing related tables
DROP TABLE IF EXISTS ab_test_events CASCADE;
DROP TABLE IF EXISTS ab_test_assignments CASCADE; 
DROP TABLE IF EXISTS ab_test_results CASCADE;
DROP TABLE IF EXISTS ab_test_variants CASCADE;
DROP TABLE IF EXISTS ab_tests CASCADE;