/**
 * TruckWithEase Personal Intelligence Engine
 * 
 * This module personalizes the entire platform in real time.
 * Every driver, dispatcher, and fleet manager gets a uniquely tailored experience
 * based on their behavior, preferences, performance, and fleet data.
 */

import { pb } from './pb';

// ─────────────────────────────────────────────────────────────────
// PERSONALIZATION CORE
// ─────────────────────────────────────────────────────────────────

/**
 * Build a complete user profile from activity, performance, and preferences
 * Returns: { userType, fleetSize, avgRpm, topTools, riskProfile, successRate, ... }
 */
export const buildUserProfile = async (userId) => {
  try {
    const activities = await pb.collection('user_activity_index').getList(1, 100, {
      filter: `session_id = "${userId}"`,
    });

    const profile = {
      userId,
      totalActions: activities.items.length,
      modules: {},
      topTools: [],
      lastActive: activities.items[0]?.created || null,
      actionTrend: [], // Last 10 action types for behavior prediction
    };

    // Aggregate by module
    activities.items.forEach(a => {
      if (!profile.modules[a.module]) {
        profile.modules[a.module] = { count: 0, avgValue: 0 };
      }
      profile.modules[a.module].count += 1;
      if (a.value) profile.modules[a.module].avgValue += a.value;
    });

    // Calculate top tools
    profile.topTools = Object.entries(profile.modules)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([module, data]) => ({ module, count: data.count }));

    // Get risk profile
    const dangerReports = await pb.collection('road_danger_reports').getList(1, 50);
    profile.riskExposure = dangerReports.items.length > 0 ? 'medium-high' : 'low';

    return profile;
  } catch (err) {
    console.error('buildUserProfile:', err);
    return null;
  }
};

/**
 * Generate personalized dashboard content based on user profile
 * Returns array of dashboard cards tailored to this user
 */
export const generatePersonalizedDashboard = async (userProfile) => {
  const cards = [];

  // If dispatcher: show driver alerts
  if (userProfile.modules['Dispatch'] || userProfile.modules['DispatchRoutingAgent']) {
    cards.push({
      type: 'driver-alerts',
      title: '🚨 Driver Alerts Live',
      description: 'Your drivers are seeing danger reports, broker flags, and weather alerts in real time at their location.',
      action: 'Monitor',
      route: '/road-context',
      priority: 'high',
    });
  }

  // If fleet user: show subscription status
  if (userProfile.fleetSize) {
    cards.push({
      type: 'subscription',
      title: '🎯 Load Board Seats',
      description: `${userProfile.fleetSize} drivers active on DAT & Uber Freight (2 seats per service).`,
      action: 'Manage',
      route: '/subscription-seats',
      priority: 'medium',
    });
  }

  // If owner-op: show rig bucks
  if (userProfile.userType === 'owner-op') {
    cards.push({
      type: 'rig-bucks',
      title: '💰 Rig Bucks Rewards',
      description: 'Earn fuel credits, maintenance rebates, and cash back on every load. Your personalized earnings dashboard.',
      action: 'View Earnings',
      route: '/rig-bucks',
      priority: 'high',
    });
  }

  // Workflow intelligence
  if (userProfile.topTools.length > 0) {
    cards.push({
      type: 'workflow-insight',
      title: '⚡ Workflow Opportunity',
      description: `You're using ${userProfile.topTools[0].module} heavily. See if we can automate these steps.`,
      action: 'Explore',
      route: '/workflow-streamliner',
      priority: 'medium',
    });
  }

  // Road Context for drivers
  if (userProfile.modules['LoadBoard'] || userProfile.modules['RouteManager']) {
    cards.push({
      type: 'road-intel',
      title: '📍 On-Road Intelligence',
      description: 'Real-time danger reports, broker ratings, and top charge stops show up exactly where you need them.',
      action: 'Get Started',
      route: '/road-context',
      priority: 'high',
    });
  }

  return cards;
};

/**
 * Predict user's next action based on behavior pattern
 * Returns: { nextModule, confidence, reason }
 */
export const predictNextAction = async (userProfile) => {
  if (!userProfile || userProfile.topTools.length === 0) return null;

  // User tends to go to their top 2 modules in sequence
  const pattern = {
    nextModule: userProfile.topTools[0].module,
    confidence: userProfile.topTools[0].count / userProfile.totalActions,
    reason: `You use ${userProfile.topTools[0].module} most often`,
  };

  return pattern;
};

/**
 * Fetch personalized onboarding tips based on user role and activity
 */
export const getPersonalizedTips = async (userId, userType) => {
  const tips = [];

  if (userType === 'dispatcher') {
    tips.push({
      id: 'road-context-intro',
      title: 'Your Drivers See Real-Time Alerts',
      content: 'Road Context shows your drivers danger reports, broker flags, weather, and top-rated charge stops right on the road. You see what they see here in Command Center.',
      route: '/road-context',
      read: false,
    });

    tips.push({
      id: 'entity-warnings',
      title: 'Broker Flags Save You Time',
      content: 'When a driver enters a broker name in Dispatch, they instantly see community complaints, pay speed ratings, and detention issues. No more bad loads.',
      route: '/fleet-memory',
      read: false,
    });
  }

  if (userType === 'owner-op') {
    tips.push({
      id: 'rig-bucks-unlock',
      title: 'You Earn Rig Bucks Here',
      content: 'Solo operators get automatic Rig Bucks: fuel credits, maintenance rebates, and cash back on loads. Track your earnings and redeem rewards.',
      route: '/rig-bucks',
      read: false,
    });

    tips.push({
      id: 'road-context-survival',
      title: 'On-Road Intelligence Changes Everything',
      content: 'Open Road Context on every trip. Community reports tell you where danger is, which shippers pay on time, and which charge stops your peers trust most.',
      route: '/road-context',
      read: false,
    });
  }

  if (userType === 'fleet-manager') {
    tips.push({
      id: 'fleet-memory',
      title: 'Your Fleet Learns from Everyone',
      content: 'Fleet Memory gathers feedback from your drivers and all subscribers: broker ratings, danger reports, top charge stops. This intel becomes your competitive edge.',
      route: '/fleet-memory',
      read: false,
    });

    tips.push({
      id: 'subscription-seats',
      title: 'Manage Your Load Board Access',
      content: 'Every DAT and Uber Freight subscription includes 2 seats. Add drivers, track usage, and upgrade seats if needed at $15 each per month.',
      route: '/subscription-seats',
      read: false,
    });
  }

  return tips;
};

// ─────────────────────────────────────────────────────────────────
// CONTEXTUAL HELP & TUTORIALS
// ─────────────────────────────────────────────────────────────────

/**
 * Return in-context tutorial text for any module
 * Based on user's role and whether they're new to the feature
 */
export const getContextualHelp = (module, userType, isFirstTime = false) => {
  const help = {
    'road-context': {
      dispatcher: 'Real-time view of what your drivers see on the road: location, speed, danger reports, broker flags, weather, and top charge stops.',
      'owner-op': 'Before you leave the lot: check for danger reports on your route, shipper ratings, and the best charge stops ahead. This is your survival toolkit.',
      'fleet-manager': 'Monitor your entire fleet route intelligence in one place. See who is in danger zones, which brokers are flagged, and where drivers are thriving.',
      firstTime: 'Welcome to Road Context. This is where your drivers make smarter decisions on every mile.',
    },
    'fleet-memory': {
      dispatcher: 'Every complaint, rating, and report from your fleet goes here. Look up a broker, shipper, or receiver in seconds to see if they are flagged.',
      'owner-op': 'Community intel about shippers, brokers, and receivers. Your peers report on pay speed, detention, communication. Use it to turn down bad loads.',
      'fleet-manager': 'Cross-fleet intelligence hub. File complaints about bad actors, rate shippers, save warnings about dangerous routes. This is your fleet collective voice.',
      firstTime: 'This is your fleet intelligence vault: broker ratings, danger reports, top stops, and real-time warnings.',
    },
    'rig-bucks': {
      'owner-op': 'Solo operator rewards program. Earn fuel credits, maintenance rebates, and cash back on every load. Redeem instantly.',
      firstTime: 'Rig Bucks is for owner-operators only. Every load, every stop, every maintenance gets you closer to a reward.',
    },
    'subscription-seats': {
      'fleet-manager': 'Manage how many drivers can access DAT and Uber Freight per subscription. 2 seats included; add more at $15/seat/month.',
      firstTime: 'Each load board subscription comes with 2 driver seats. Add more drivers or upgrade to additional seats here.',
    },
    'dispatch': {
      dispatcher: 'Assign loads to drivers, track broker communication, see warnings in real time. When a driver enters a broker name, they see flags immediately.',
      firstTime: 'Dispatch is where loads meet drivers. Flag warnings show up as drivers work, protecting them from bad brokers before they accept.',
    },
    'workflow-streamliner': {
      dispatcher: 'Model any operation (dispatch, driver ops, compliance, finance). Score it 0-100, get AI insights on bottlenecks and automation, and own your process.',
      'fleet-manager': 'Build operation models for every area of your business. See where time, money, and people are stuck. AI tells you what to automate first.',
      firstTime: 'Pick a company operation, model it step by step, and let AI show you where to automate and improve.',
    },
  };

  const moduleHelp = help[module] || {};
  return moduleHelp[userType] || moduleHelp[isFirstTime ? 'firstTime' : 'dispatcher'] || 'Feature help not yet available.';
};

// ─────────────────────────────────────────────────────────────────
// PERFORMANCE INSIGHTS
// ─────────────────────────────────────────────────────────────────

/**
 * Calculate personalized performance metrics and recommendations
 */
export const getPerformanceInsights = async (userId) => {
  try {
    const activities = await pb.collection('user_activity_index').getList(1, 100, {
      filter: `session_id = "${userId}"`,
    });

    const insights = {
      actionVelocity: activities.items.length, // How active is this user
      diversityScore: new Set(activities.items.map(a => a.module)).size / 5, // Do they use multiple tools
      recommendations: [],
    };

    // If low activity: suggest high-impact features
    if (insights.actionVelocity < 10) {
      insights.recommendations.push({
        title: 'Try Road Context',
        reason: 'Real-time alerts on the road make every decision safer',
        action: '/road-context',
      });
    }

    // If using only 1-2 modules: suggest related tools
    if (insights.diversityScore < 0.3) {
      insights.recommendations.push({
        title: 'Explore Fleet Memory',
        reason: 'Broker intel and danger reports are critical for your type of work',
        action: '/fleet-memory',
      });
    }

    return insights;
  } catch (err) {
    console.error('getPerformanceInsights:', err);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────
// SMART NOTIFICATIONS & ALERTS
// ─────────────────────────────────────────────────────────────────

/**
 * Generate personalized alerts based on user behavior and fleet data
 */
export const generateSmartAlerts = async (userId, userProfile) => {
  const alerts = [];

  // Critical danger alerts
  try {
    const dangerReports = await pb.collection('road_danger_reports').getList(1, 10, {
      sort: '-confirmed_count',
    });
    if (dangerReports.items.length > 0) {
      alerts.push({
        severity: 'critical',
        title: '⚠️ Danger Report Spike',
        description: `${dangerReports.items[0].description} — ${dangerReports.items[0].confirmed_count} drivers confirmed.`,
        action: '/road-context',
      });
    }
  } catch (err) {
    console.log('Danger alerts fetch:', err);
  }

  // Broker flag alerts
  try {
    const badRatings = await pb.collection('shipper_broker_ratings').getList(1, 5, {
      filter: 'rating < 2',
      sort: '-created',
    });
    if (badRatings.items.length > 0) {
      alerts.push({
        severity: 'high',
        title: '🚩 Broker Alert',
        description: `${badRatings.items[0].company_name} has low ratings. Check Fleet Memory before accepting loads.`,
        action: '/fleet-memory',
      });
    }
  } catch (err) {
    console.log('Broker alerts fetch:', err);
  }

  return alerts;
};

// ─────────────────────────────────────────────────────────────────
// FEATURE DISCOVERY
// ─────────────────────────────────────────────────────────────────

/**
 * Detect user capabilities and suggest related features
 */
export const suggestNextFeatures = (userProfile, userType) => {
  const suggestions = [];

  // If they use dispatch: suggest road context
  if (userProfile.modules['Dispatch']) {
    suggestions.push({
      title: 'Monitor drivers in real time',
      feature: 'Road Context',
      route: '/road-context',
      why: 'See exactly what your drivers see on the road — danger alerts, broker flags, charge stops.',
    });
  }

  // If they check brokers: suggest fleet memory
  if (userProfile.modules['LoadBoard'] || userProfile.modules['Dispatch']) {
    suggestions.push({
      title: 'Protect against bad brokers',
      feature: 'Fleet Memory',
      route: '/fleet-memory',
      why: 'Community intel on shippers and brokers. Know before you accept.',
    });
  }

  // If they're active: suggest workflow modeling
  if (userProfile.totalActions > 20) {
    suggestions.push({
      title: 'Automate your operations',
      feature: 'Workflow Streamliner',
      route: '/workflow-streamliner',
      why: 'Model any company operation and get AI insights on bottlenecks and automation.',
    });
  }

  // Owner-ops: suggest rig bucks
  if (userType === 'owner-op') {
    suggestions.push({
      title: 'Earn rewards',
      feature: 'Rig Bucks',
      route: '/rig-bucks',
      why: 'Fuel credits, maintenance rebates, cash back. Automatic for every load.',
    });
  }

  return suggestions.slice(0, 3);
};

// ─────────────────────────────────────────────────────────────────
// DATA-DRIVEN PERSONALIZATION
// ─────────────────────────────────────────────────────────────────

/**
 * Load and cache user personalization data
 * Returns complete personalization context
 */
export const loadPersonalizationContext = async (userId, userType) => {
  try {
    const profile = await buildUserProfile(userId);
    if (!profile) return null;

    const dashboard = await generatePersonalizedDashboard(profile);
    const tips = await getPersonalizedTips(userId, userType);
    const nextAction = await predictNextAction(profile);
    const alerts = await generateSmartAlerts(userId, profile);
    const suggestions = suggestNextFeatures(profile, userType);
    const insights = await getPerformanceInsights(userId);

    return {
      profile,
      dashboard,
      tips,
      nextAction,
      alerts,
      suggestions,
      insights,
      cachedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error('loadPersonalizationContext:', err);
    return null;
  }
};

export default {
  buildUserProfile,
  generatePersonalizedDashboard,
  predictNextAction,
  getPersonalizedTips,
  getContextualHelp,
  getPerformanceInsights,
  generateSmartAlerts,
  suggestNextFeatures,
  loadPersonalizationContext,
};
