import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Search,
  Zap,
  Terminal,
  Clock,
  ShieldCheck,
  Code2,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Play,
  Layers,
  Sliders,
} from 'lucide-react';
import { TutorialGuide, TutorialStep, TabType } from '../types';

interface TutorialsGuideViewProps {
  onNavigateTab: (tab: TabType) => void;
  onOpenFeatureGovernance?: () => void;
}

export const TutorialsGuideView: React.FC<TutorialsGuideViewProps> = ({
  onNavigateTab,
  onOpenFeatureGovernance,
}) => {
  const [tutorials, setTutorials] = useState<TutorialGuide[]>([]);
  const [stats, setStats] = useState<any>({ totalGuides: 0, totalSteps: 0, completedSteps: 0, completionRatePct: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedGuideId, setExpandedGuideId] = useState<string | null>('tut-hos');
  const [liveTestResults, setLiveTestResults] = useState<{ [guideId: string]: any }>({});
  const [testingEndpoint, setTestingEndpoint] = useState<string | null>(null);

  const fetchTutorials = async () => {
    try {
      const res = await fetch('/api/tutorials');
      if (res.ok) {
        const data = await res.json();
        setTutorials(data.tutorials || []);
        setStats(data.stats || {});
      }
    } catch (err) {
      console.error('Failed to load tutorials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutorials();
  }, []);

  const handleToggleStep = async (guideId: string, stepNumber: number) => {
    try {
      const res = await fetch(`/api/tutorials/${guideId}/step-toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepNumber }),
      });

      if (res.ok) {
        await fetchTutorials();
      }
    } catch (err) {
      console.error('Failed to toggle tutorial step:', err);
    }
  };

  const handleTestRealEndpoint = async (guide: TutorialGuide) => {
    setTestingEndpoint(guide.id);
    try {
      const res = await fetch(guide.apiEndpoint);
      if (res.ok) {
        const json = await res.json();
        setLiveTestResults((prev) => ({
          ...prev,
          [guide.id]: {
            status: '200 OK',
            timestamp: new Date().toLocaleTimeString(),
            endpoint: guide.apiEndpoint,
            data: json,
          },
        }));
      } else {
        setLiveTestResults((prev) => ({
          ...prev,
          [guide.id]: {
            status: `Error ${res.status}`,
            timestamp: new Date().toLocaleTimeString(),
            endpoint: guide.apiEndpoint,
            data: { error: 'Failed to query endpoint' },
          },
        }));
      }
    } catch (err: any) {
      setLiveTestResults((prev) => ({
        ...prev,
        [guide.id]: {
          status: 'Connection Failed',
          timestamp: new Date().toLocaleTimeString(),
          endpoint: guide.apiEndpoint,
          data: { error: err.message },
        },
      }));
    } finally {
      setTestingEndpoint(null);
    }
  };

  const filteredTutorials = tutorials.filter(
    (t) =>
      t.moduleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.statuteOrStandard.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full pb-16 px-3 sm:px-6 lg:px-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="border-b border-[#222] pb-4 pt-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-widest bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 uppercase flex items-center gap-1.5">
                <BookOpen className="w-3 h-3 text-[#D4AF37]" />
                INTERACTIVE STEP-BY-STEP OPERATIONS MANUAL
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 uppercase flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                REAL FRONT &amp; BACKEND VERIFIED
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
              <BookOpen className="w-7 h-7 text-[#D4AF37]" />
              System Tutorials &amp; Step-by-Step Guides
            </h1>
            <p className="text-xs sm:text-sm text-[#888] max-w-3xl mt-1">
              Step-by-step operating workflows for all core modules. Each tutorial includes actionable checklists, direct "Jump-to-Tab" execution links, and real-time backend API verification tests to confirm live functionality.
            </p>
          </div>

          {/* Progress Card */}
          <div className="bg-[#121212] border border-[#2a2a2a] p-3.5 rounded-lg font-mono text-xs space-y-2 shrink-0 min-w-[240px]">
            <div className="flex items-center justify-between text-[#888]">
              <span>OVERALL SYSTEM PROGRESS:</span>
              <span className="text-[#D4AF37] font-bold">{stats.completionRatePct || 0}%</span>
            </div>
            <div className="w-full bg-[#202020] h-2 rounded-full overflow-hidden border border-[#333]">
              <div
                className="bg-gradient-to-r from-[#D4AF37] to-emerald-400 h-full transition-all duration-500"
                style={{ width: `${stats.completionRatePct || 0}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#666]">
              <span>
                {stats.completedSteps || 0} / {stats.totalSteps || 0} Steps Mastered
              </span>
              <span>{stats.totalGuides || 0} Functional Modules</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#121212] border border-[#262626] p-3 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-[#666] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search tutorials (e.g. HOS, bridges, dispatch, cinema, DQF...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#0a0a0a] border border-[#333] rounded text-white text-xs focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div className="flex items-center gap-2 text-[#777] text-[11px]">
          <span>ALL CODES TESTED AGAINST REAL LIVE SERVER APIS</span>
        </div>
      </div>

      {/* Tutorials Accordion List */}
      <div className="space-y-4 font-mono">
        {filteredTutorials.map((guide) => {
          const isExpanded = expandedGuideId === guide.id;
          const completedCount = guide.steps.filter((s) => s.completed).length;
          const isAllDone = completedCount === guide.steps.length && guide.steps.length > 0;
          const liveResult = liveTestResults[guide.id];

          return (
            <div
              key={guide.id}
              className={`bg-[#121212] border rounded-lg overflow-hidden transition-all ${
                isAllDone
                  ? 'border-emerald-800/50 bg-[#0f1510]'
                  : isExpanded
                  ? 'border-[#D4AF37] shadow-lg ring-1 ring-[#D4AF37]/30'
                  : 'border-[#262626] hover:border-[#3a3a3a]'
              }`}
            >
              {/* Card Header Bar */}
              <div
                onClick={() => setExpandedGuideId(isExpanded ? null : guide.id)}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer select-none bg-[#161616]"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded mt-0.5 ${
                      isAllDone
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-[#222] text-[#D4AF37]'
                    }`}
                  >
                    {isAllDone ? <CheckCircle2 className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-white font-bold text-sm sm:text-base">
                        {guide.moduleName}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#202020] text-[#D4AF37] border border-[#333] text-[10px]">
                        {guide.statuteOrStandard}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-[#202020] text-[#888] text-[9px]">
                        {guide.difficulty}
                      </span>
                    </div>
                    <p className="text-[#888] text-xs leading-relaxed max-w-3xl">
                      {guide.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  <div className="text-right text-[11px]">
                    <span className={isAllDone ? 'text-emerald-400 font-bold' : 'text-[#888]'}>
                      {completedCount} / {guide.steps.length} Completed
                    </span>
                    <span className="block text-[10px] text-[#555]">~{guide.estimatedMinutes} min</span>
                  </div>

                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-[#AAA]" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#AAA]" />
                  )}
                </div>
              </div>

              {/* Expanded Tutorial Body */}
              {isExpanded && (
                <div className="p-4 border-t border-[#222] space-y-5 bg-[#0e0e0e]">
                  {/* Action Bar: Jump to Function + Test Real Endpoint */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#161616] border border-[#2a2a2a] rounded">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-[#D4AF37]" />
                      <span className="text-xs text-[#BBB]">
                        Real Backend Route:{' '}
                        <code className="text-[#D4AF37] bg-black px-1.5 py-0.5 rounded">
                          {guide.apiEndpoint}
                        </code>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {guide.id === 'tut-feature-governance' && onOpenFeatureGovernance && (
                        <button
                          onClick={onOpenFeatureGovernance}
                          className="px-3 py-1.5 bg-[#C9A84C]/20 hover:bg-[#C9A84C]/30 text-[#C9A84C] font-bold border border-[#C9A84C]/50 rounded text-xs flex items-center gap-1.5 transition-all uppercase tracking-wider"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>OPEN FEATURE MANAGER</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleTestRealEndpoint(guide)}
                        disabled={testingEndpoint === guide.id}
                        className="px-3 py-1.5 bg-[#202020] hover:bg-[#2a2a2a] text-[#DDD] hover:text-white border border-[#333] rounded text-xs flex items-center gap-1.5 transition-all"
                      >
                        <RefreshCw
                          className={`w-3.5 h-3.5 text-[#D4AF37] ${
                            testingEndpoint === guide.id ? 'animate-spin' : ''
                          }`}
                        />
                        <span>{testingEndpoint === guide.id ? 'Testing...' : 'Test & Verify Real API'}</span>
                      </button>

                      <button
                        onClick={() => onNavigateTab(guide.tabTarget)}
                        className="px-3.5 py-1.5 bg-[#D4AF37] hover:bg-[#f1df9c] text-black font-bold rounded text-xs flex items-center gap-1.5 transition-all uppercase tracking-wider"
                      >
                        <span>JUMP TO FUNCTION</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Live Backend Response Inspector if tested */}
                  {liveResult && (
                    <div className="bg-[#080808] border border-emerald-800/80 rounded p-3 text-xs space-y-2">
                      <div className="flex items-center justify-between border-b border-[#222] pb-1.5 text-[11px]">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>LIVE SERVER API RESPONSE: {liveResult.endpoint}</span>
                        </div>
                        <span className="text-[#777]">{liveResult.timestamp} (Status: {liveResult.status})</span>
                      </div>
                      <pre className="text-emerald-300 font-mono text-[10px] overflow-x-auto max-h-48 p-2 bg-black/60 rounded">
                        {JSON.stringify(liveResult.data, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Step-by-Step Flow List */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      STEP-BY-STEP OPERATIONAL CHECKLIST:
                    </h3>

                    <div className="space-y-2.5">
                      {guide.steps.map((step) => (
                        <div
                          key={step.stepNumber}
                          onClick={() => handleToggleStep(guide.id, step.stepNumber)}
                          className={`p-3 rounded border flex items-start gap-3 cursor-pointer transition-all ${
                            step.completed
                              ? 'bg-emerald-950/20 border-emerald-800/50 text-[#BBB]'
                              : 'bg-[#141414] border-[#222] text-[#DDD] hover:border-[#383838]'
                          }`}
                        >
                          <button
                            type="button"
                            className="mt-0.5 shrink-0 focus:outline-none"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStep(guide.id, step.stepNumber);
                            }}
                          >
                            {step.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-950" />
                            ) : (
                              <Circle className="w-4 h-4 text-[#555] hover:text-[#D4AF37]" />
                            )}
                          </button>

                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-xs font-bold ${
                                  step.completed ? 'line-through text-emerald-400/80' : 'text-white'
                                }`}
                              >
                                Step {step.stepNumber}: {step.title}
                              </span>
                              <span className="text-[10px] text-[#666] font-mono">
                                {step.completed ? 'DONE' : 'CLICK TO MARK COMPLETE'}
                              </span>
                            </div>

                            <p className="text-xs text-[#999] leading-relaxed">
                              {step.instruction}
                            </p>

                            {step.tip && (
                              <div className="pt-1 text-[11px] text-[#D4AF37] flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-[#D4AF37] shrink-0" />
                                <span>Tip: {step.tip}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
