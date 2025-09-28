import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  BarChart3,
  PlayCircle,
  Activity,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { keywordMigrationService, MigrationStats, MigrationResult } from '@/services/keywordMigrationService';
import { toast } from 'sonner';

export const MigrationDashboard: React.FC = () => {
  const [stats, setStats] = useState<MigrationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [testing, setTesting] = useState(false);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [testResults, setTestResults] = useState<any>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const migrationStats = await keywordMigrationService.getMigrationStats();
      setStats(migrationStats);
    } catch (error) {
      console.error('Error loading migration stats:', error);
      toast.error('Failed to load migration statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleMigration = async () => {
    try {
      setMigrating(true);
      const result = await keywordMigrationService.migrateLegacyKeywords();
      setMigrationResult(result);
      await loadStats(); // Refresh stats
    } catch (error) {
      console.error('Migration error:', error);
      toast.error('Migration failed');
    } finally {
      setMigrating(false);
    }
  };

  const handleTests = async () => {
    try {
      setTesting(true);
      const results = await keywordMigrationService.runIntegrationTests();
      setTestResults(results);
    } catch (error) {
      console.error('Testing error:', error);
      toast.error('Integration tests failed');
    } finally {
      setTesting(false);
    }
  };

  const getMigrationProgress = () => {
    if (!stats) return 0;
    const total = stats.total_legacy + stats.total_unified;
    return total > 0 ? (stats.total_unified / total) * 100 : 100;
  };

  const getDataFreshnessProgress = () => {
    if (!stats) return 0;
    const fresh = stats.total_unified - stats.stale_serp_data;
    return stats.total_unified > 0 ? (fresh / stats.total_unified) * 100 : 100;
  };

  if (loading && !stats) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Loading migration dashboard...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Keyword Migration & Testing</h2>
          <p className="text-muted-foreground">
            Migrate legacy data and test integration functionality
          </p>
        </div>
        <Button
          onClick={loadStats}
          variant="outline"
          size="sm"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Legacy Keywords</p>
                <p className="text-2xl font-bold">{stats?.total_legacy || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Unified Keywords</p>
                <p className="text-2xl font-bold">{stats?.total_unified || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Stale SERP Data</p>
                <p className="text-2xl font-bold">{stats?.stale_serp_data || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Usage Tracked</p>
                <p className="text-2xl font-bold">{stats?.usage_tracked || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Migration Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Data Migration Progress</span>
          </CardTitle>
          <CardDescription>
            Track the migration of legacy keywords to the unified system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Migration Progress</span>
              <span className="text-sm text-muted-foreground">
                {getMigrationProgress().toFixed(1)}%
              </span>
            </div>
            <Progress value={getMigrationProgress()} className="h-2" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">SERP Data Freshness</span>
              <span className="text-sm text-muted-foreground">
                {getDataFreshnessProgress().toFixed(1)}%
              </span>
            </div>
            <Progress value={getDataFreshnessProgress()} className="h-2" />
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              onClick={handleMigration}
              disabled={migrating || (stats?.pending_migration || 0) === 0}
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${migrating ? 'animate-spin' : ''}`} />
              {migrating ? 'Migrating...' : 'Run Migration'}
            </Button>

            <Button
              onClick={handleTests}
              disabled={testing}
              variant="outline"
              size="sm"
            >
              <PlayCircle className={`h-4 w-4 mr-2 ${testing ? 'animate-spin' : ''}`} />
              {testing ? 'Testing...' : 'Run Tests'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Migration Results */}
      <AnimatePresence>
        {migrationResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {migrationResult.success ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span>Migration Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {migrationResult.migrated}
                    </p>
                    <p className="text-sm text-muted-foreground">Migrated</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">
                      {migrationResult.duplicates}
                    </p>
                    <p className="text-sm text-muted-foreground">Duplicates</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {migrationResult.errors.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Errors</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Details:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    <div>Legacy Keywords: {migrationResult.details.legacy_keywords}</div>
                    <div>Glossary Terms: {migrationResult.details.glossary_terms}</div>
                    <div>Strategy Keywords: {migrationResult.details.strategy_keywords}</div>
                  </div>
                </div>

                {migrationResult.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-red-600">Errors:</h4>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {migrationResult.errors.map((error, index) => (
                        <p key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          {error}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Test Results */}
      <AnimatePresence>
        {testResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Integration Test Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>SERP Integration</span>
                    <Badge variant={testResults.serp ? 'default' : 'destructive'}>
                      {testResults.serp ? 'PASS' : 'FAIL'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Usage Tracking</span>
                    <Badge variant={testResults.usage ? 'default' : 'destructive'}>
                      {testResults.usage ? 'PASS' : 'FAIL'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Migration Connectivity</span>
                    <Badge variant={testResults.migration ? 'default' : 'destructive'}>
                      {testResults.migration ? 'PASS' : 'FAIL'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};