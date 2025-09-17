/**
 * Analysis debugging utilities for tracking optimization progress
 */

export interface AnalysisPhase {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  suggestionsCount: number;
  error?: string;
  duration?: number;
}

export class AnalysisDebugger {
  private phases: AnalysisPhase[] = [
    { id: 'content', name: 'Content Quality Analysis', status: 'pending', suggestionsCount: 0 },
    { id: 'ai', name: 'AI Detection Analysis', status: 'pending', suggestionsCount: 0 },
    { id: 'serp', name: 'SERP Integration Analysis', status: 'pending', suggestionsCount: 0 },
    { id: 'solution', name: 'Solution Analysis', status: 'pending', suggestionsCount: 0 }
  ];

  private startTimes: Record<string, number> = {};

  startPhase(phaseId: string) {
    console.log(`🚀 Starting phase: ${phaseId}`);
    this.startTimes[phaseId] = Date.now();
    
    const phase = this.phases.find(p => p.id === phaseId);
    if (phase) {
      phase.status = 'running';
    }
  }

  completePhase(phaseId: string, suggestionsCount: number) {
    const duration = Date.now() - (this.startTimes[phaseId] || 0);
    console.log(`✅ Completed phase: ${phaseId} (${duration}ms) - ${suggestionsCount} suggestions`);
    
    const phase = this.phases.find(p => p.id === phaseId);
    if (phase) {
      phase.status = 'completed';
      phase.suggestionsCount = suggestionsCount;
      phase.duration = duration;
    }
  }

  failPhase(phaseId: string, error: string) {
    const duration = Date.now() - (this.startTimes[phaseId] || 0);
    console.log(`❌ Failed phase: ${phaseId} (${duration}ms) - ${error}`);
    
    const phase = this.phases.find(p => p.id === phaseId);
    if (phase) {
      phase.status = 'failed';
      phase.error = error;
      phase.duration = duration;
    }
  }

  getReport() {
    const completed = this.phases.filter(p => p.status === 'completed').length;
    const failed = this.phases.filter(p => p.status === 'failed').length;
    const totalSuggestions = this.phases.reduce((sum, p) => sum + p.suggestionsCount, 0);
    const totalDuration = this.phases.reduce((sum, p) => sum + (p.duration || 0), 0);

    return {
      phases: this.phases,
      completed,
      failed,
      total: this.phases.length,
      totalSuggestions,
      totalDuration,
      summary: `${completed}/${this.phases.length} phases completed, ${totalSuggestions} total suggestions, ${Math.round(totalDuration / 1000)}s duration`
    };
  }

  logReport() {
    const report = this.getReport();
    console.log('📊 Analysis Report:', report);
    
    console.table(this.phases.map(p => ({
      Phase: p.name,
      Status: p.status,
      Suggestions: p.suggestionsCount,
      Duration: p.duration ? `${p.duration}ms` : '-',
      Error: p.error || '-'
    })));

    return report;
  }

  reset() {
    this.phases.forEach(phase => {
      phase.status = 'pending';
      phase.suggestionsCount = 0;
      phase.duration = undefined;
      phase.error = undefined;
    });
    this.startTimes = {};
  }
}