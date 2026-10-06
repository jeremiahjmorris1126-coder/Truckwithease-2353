/**
 * Onboarding Integration Layer
 * Wires onboarding wizard into every page and module
 * Tracks first-time user state and shows contextual walkthroughs
 */

import { pb } from './pb.js';
import { getTutorialSections, getTutorial } from './tutorials.js';
import { getContextualHelp } from './truckWithEase.js';

// ─────────────────────────────────────────────────────────────────
// FIRST-TIME USER DETECTION
// ─────────────────────────────────────────────────────────────────

/**
 * Check if user has completed onboarding
 */
export const hasCompletedOnboarding = (userId) => {
  try {
    const completed = localStorage.getItem(`onboarding_complete_${userId}`);
    return completed === 'true';
  } catch (e) {
    return false;
  }
};

/**
 * Mark onboarding as complete for user
 */
export const markOnboardingComplete = (userId) => {
  try {
    localStorage.setItem(`onboarding_complete_${userId}`, 'true');
    localStorage.setItem(`onboarding_completed_at_${userId}`, new Date().toISOString());
  } catch (e) {
    console.error('Error marking onboarding complete:', e);
  }
};

/**
 * Get user's onboarding state
 */
export const getOnboardingState = (userId) => {
  try {
    return {
      completed: localStorage.getItem(`onboarding_complete_${userId}`) === 'true',
      completedAt: localStorage.getItem(`onboarding_completed_at_${userId}`),
      userType: localStorage.getItem(`user_type_${userId}`),
      fleetSize: localStorage.getItem(`fleet_size_${userId}`),
    };
  } catch (e) {
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────
// MODULE-LEVEL ONBOARDING TOOLTIPS
// ─────────────────────────────────────────────────────────────────

/**
 * Get a first-time tooltip for any module
 * Returns { title, description, actionText, actionRoute }
 */
export const getModuleOnboardingTooltip = (module, userType, isFirstVisit = false) => {
  if (!isFirstVisit) return null;

  const tooltips = {
    'dispatch': {
      dispatcher: {
        title: '🎯 Broker Flags Show Up Here',
        description: 'When you assign a load and the broker is flagged, you see a red warning immediately. Your drivers see it too.',
        actionText: 'Got it',
        actionRoute: null,
      },
    },
    'load-board': {
      dispatcher: {
        title: '📋 No Response? We Help You Follow Up',
        description: 'Click "No Response" on a stalled load and get a ready-to-send script. Mark it sent and move on.',
        actionText: 'Show me',
        actionRoute: '/fleet-load-board',
      },
    },
    'fleet-memory': {
      dispatcher: {
        title: '🏴 Know Every Broker Before You Assign',
        description: 'Search any broker or shipper. See ratings, complaints, and warnings from your fleet and peers.',
        actionText: 'Explore',
        actionRoute: '/fleet-memory',
      },
      'owner-op': {
        title: '🏴 Community Intel on Bad Loads',
        description: 'Before you accept, search the shipper. See what other drivers experienced with them.',
        actionText: 'Try it',
        actionRoute: '/fleet-memory',
      },
    },
    'road-context': {
      'owner-op': {
        title: '📍 Your Survival Toolkit on the Road',
        description: 'Danger reports, broker ratings, top stops, and weather — all right where you need them.',
        actionText: 'Open now',
        actionRoute: '/road-context',
      },
      dispatcher: {
        title: '📍 See What Your Drivers See',
        description: 'Real-time alerts: driver location, danger reports, broker flags, top-rated stops.',
        actionText: 'Monitor',
        actionRoute: '/road-context',
      },
    },
    'rig-bucks': {
      'owner-op': {
        title: '💰 You Earn on Every Load',
        description: 'Fuel credits, maintenance rebates, cash back. Automatic. Redeem anytime.',
        actionText: 'Track earnings',
        actionRoute: '/rig-bucks',
      },
    },
    'workflow-streamliner': {
      dispatcher: {
        title: '⚡ Model Your Dispatch Operation',
        description: 'Step by step. Get a 0-100 score. Find bottlenecks. Automate the highest-impact steps.',
        actionText: 'Start modeling',
        actionRoute: '/workflow-streamliner',
      },
      'fleet-manager': {
        title: '⚡ Streamline Your Entire Operation',
        description: 'Pick any area of your business. Model it. Get AI insights on automation and improvement.',
        actionText: 'Explore templates',
        actionRoute: '/workflow-streamliner',
      },
    },
  };

  const moduleTooltips = tooltips[module];
  if (!moduleTooltips) return null;

  return moduleTooltips[userType] || null;
};

// ─────────────────────────────────────────────────────────────────
// INLINE TUTORIAL BANNERS
// ─────────────────────────────────────────────────────────────────

/**
 * Get inline tutorial section for a module
 * Shows contextual help text with "Learn more" button
 */
export const getInlineTutorial = (module, userType, sectionIndex = 0) => {
  const tutorial = getTutorial(module, userType, sectionIndex);
  if (!tutorial || !tutorial.section) return null;

  return {
    title: tutorial.title,
    currentSection: tutorial.currentSection,
    totalSections: tutorial.totalSections,
    heading: tutorial.section.heading,
    text: tutorial.section.text,
    nextSection: sectionIndex + 1 < tutorial.totalSections,
  };
};

// ─────────────────────────────────────────────────────────────────
// ACHIEVEMENT TRACKING
// ─────────────────────────────────────────────────────────────────

/**
 * Track onboarding achievements
 * "First load assigned", "First entity lookup", "First danger report filed"
 */
export const recordAchievement = async (userId, achievementType, detail = {}) => {
  try {
    // Log to user activity
    await pb.collection('user_activity_index').create({
      session_id: userId,
      action_type: `achievement_${achievementType}`,
      module: 'Onboarding',
      detail: JSON.stringify(detail),
      value: 1,
      device: navigator.userAgent.substring(0, 100),
    });

    // Store locally for badge display
    localStorage.setItem(
      `achievement_${achievementType}_${userId}`,
      new Date().toISOString()
    );
  } catch (e) {
    console.error('Error recording achievement:', e);
  }
};

/**
 * Get user's unlocked achievements
 */
export const getAchievements = (userId) => {
  const achievements = {
    'first-load-assigned': false,
    'first-entity-lookup': false,
    'first-route-saved': false,
    'first-danger-report': false,
    'first-broker-rating': false,
    'first-workflow-model': false,
  };

  try {
    Object.keys(achievements).forEach(achievement => {
      const key = `achievement_${achievement}_${userId}`;
      achievements[achievement] = localStorage.getItem(key) !== null;
    });
  } catch (e) {
    console.error('Error fetching achievements:', e);
  }

  return achievements;
};

// ─────────────────────────────────────────────────────────────────
// SMART ONBOARDING FLOWS
// ─────────────────────────────────────────────────────────────────

/**
 * Suggest next step based on completed actions
 * Used to guide new users toward their first meaningful action
 */
export const getNextOnboardingStep = (userId, userType, completedActions = []) => {
  const steps = {
    'owner-op': [
      {
        action: 'open-road-context',
        title: 'See Your Survival Toolkit',
        description: 'Open Road Context to see danger reports, broker ratings, and top stops for any route.',
        route: '/road-context',
        required: false,
      },
      {
        action: 'search-broker',
        title: 'Check a Shipper Before Load',
        description: 'Search any shipper name in Fleet Memory. See ratings and warnings from other drivers.',
        route: '/fleet-memory',
        required: false,
      },
      {
        action: 'view-rig-bucks',
        title: 'Track Your Rewards',
        description: 'Every load earns Rig Bucks. Fuel credits, maintenance rebates, cash back.',
        route: '/rig-bucks',
        required: false,
      },
    ],
    'dispatcher': [
      {
        action: 'assign-first-load',
        title: 'Assign a Load with Confidence',
        description: 'Broker flags appear when you assign. Your drivers see warnings before they accept.',
        route: '/dispatch',
        required: true,
      },
      {
        action: 'monitor-drivers',
        title: 'Monitor Your Drivers Live',
        description: 'Open Road Context to see what your drivers see in real time.',
        route: '/road-context',
        required: false,
      },
      {
        action: 'follow-up-stalled',
        title: 'Follow Up on Stalled Loads',
        description: 'Unclaimed load? Click "No Response" and get a ready-to-send follow-up script.',
        route: '/fleet-load-board',
        required: false,
      },
    ],
    'fleet-manager': [
      {
        action: 'manage-seats',
        title: 'Set Up Driver Access',
        description: 'Add drivers to DAT and Uber Freight. 2 seats included per subscription.',
        route: '/subscription-seats',
        required: true,
      },
      {
        action: 'model-operation',
        title: 'Model an Operation',
        description: 'Pick dispatch, driver ops, or finance. Get AI insights on bottlenecks and automation.',
        route: '/workflow-streamliner',
        required: false,
      },
      {
        action: 'rate-shipper',
        title: 'Share Feedback on Shippers',
        description: 'Rate shippers and brokers based on your fleet's experience. Help the industry.',
        route: '/fleet-memory',
        required: false,
      },
    ],
  };

  const userSteps = steps[userType] || [];
  const remainingSteps = userSteps.filter(s => !completedActions.includes(s.action));

  return remainingSteps.slice(0, 2); // Return next 2 steps
};

/**
 * Create a guided checklist for user's first week
 */
export const getFirstWeekChecklist = (userType) => {
  const checklists = {
    'owner-op': [
      { day: 1, task: 'Complete onboarding wizard', done: false },
      { day: 1, task: 'Open Road Context on your next trip', done: false },
      { day: 1, task: 'Save a route with charge stops', done: false },
      { day: 2, task: 'File your first broker feedback', done: false },
      { day: 3, task: 'Rate a shipper or receiver', done: false },
      { day: 5, task: 'Check your Rig Bucks earnings', done: false },
    ],
    'dispatcher': [
      { day: 1, task: 'Complete onboarding wizard', done: false },
      { day: 1, task: 'Assign first load (see broker flags)', done: false },
      { day: 1, task: 'Monitor drivers in Road Context', done: false },
      { day: 2, task: 'Follow up on a stalled load', done: false },
      { day: 3, task: 'Rate a shipper based on driver feedback', done: false },
      { day: 5, task: 'Run Broker Alerts on your load board', done: false },
    ],
    'fleet-manager': [
      { day: 1, task: 'Complete onboarding wizard', done: false },
      { day: 1, task: 'Add drivers to load board subscriptions', done: false },
      { day: 2, task: 'Model your dispatch operation', done: false },
      { day: 3, task: 'Review driver activity in personal index', done: false },
      { day: 5, task: 'Rate a shipper based on fleet experience', done: false },
      { day: 7, task: 'Review Workflow Streamliner AI insights', done: false },
    ],
  };

  return checklists[userType] || [];
};

export default {
  hasCompletedOnboarding,
  markOnboardingComplete,
  getOnboardingState,
  getModuleOnboardingTooltip,
  getInlineTutorial,
  recordAchievement,
  getAchievements,
  getNextOnboardingStep,
  getFirstWeekChecklist,
};
