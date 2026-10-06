/**
 * TruckWithEase Platform Tutorials & Onboarding
 * 
 * Every page has contextual, role-based help that changes as you learn.
 * Personalized to dispatcher, owner-op, or fleet manager.
 */

export const tutorials = {
  // ROAD CONTEXT TUTORIALS
  'road-context': {
    dispatcher: {
      title: '📍 Road Context — Your Drivers, Live',
      sections: [
        {
          heading: 'What Your Drivers See',
          text: 'Every driver on a load sees real-time intelligence: their location, speed, current load details, danger reports from other drivers, broker flags pulled from your fleet intelligence, top-rated charge stops ahead, weather alerts, and messages from brokers.',
        },
        {
          heading: 'Why It Matters',
          text: 'Smarter drivers make better decisions. They avoid dangerous routes. They turn down flagged shippers. They find charge stops your fleet trusts. You get fewer accidents, fewer bad loads, fewer complaints.',
        },
        {
          heading: 'Your View',
          text: 'As a dispatcher, you see exactly what they see — their location, their load, their alerts — right here in the Road Context monitor. If a driver is in a danger zone, you see it immediately.',
        },
        {
          heading: 'Quick Start',
          text: 'Open Road Context anytime to see live driver intel. Check the alerts sidebar to spot critical issues. Click "Monitor" from Command Center.',
        },
      ],
    },
    'owner-op': {
      title: '📍 Road Context — Your Survival Toolkit',
      sections: [
        {
          heading: 'Before Every Trip',
          text: 'Open Road Context and load your destination. The app shows you real-time danger reports, shipper/broker ratings, weather, and the best charge stops ahead — all based on what your fleet peers have reported.',
        },
        {
          heading: 'Danger Reports',
          text: 'Other drivers report dangerous roads: snow, construction, unsafe areas. When a location gets multiple reports, it shows as "CONFIRMED DANGEROUS." You decide: reroute or continue?',
        },
        {
          heading: 'Broker Flags',
          text: 'Your load shows the shipper name. If that shipper is flagged for slow pay, detention issues, or communication problems, you see it instantly. No surprises.',
        },
        {
          heading: 'Top Charge Stops',
          text: 'Before you need fuel, the app shows you the best-rated stops for your truck type — ranked by your peers\' feedback. Green means trusted.',
        },
      ],
    },
    'fleet-manager': {
      title: '📍 Road Context — Fleet Intelligence Command',
      sections: [
        {
          heading: 'Monitor Your Fleet',
          text: 'See every active driver's location, speed, current load, and the alerts they're seeing in real time. If a driver enters a danger zone or gets a broker flag, you see it immediately.',
        },
        {
          heading: 'Spot Trends',
          text: 'If multiple drivers report the same danger zone, it bubbles up. If a shipper gets multiple bad ratings, you flag them internally. Your fleet learns faster.',
        },
        {
          heading: 'Support Drivers',
          text: 'Drivers can call dispatch or file issues directly from Road Context. You see those requests in your driver alerts sidebar.',
        },
        {
          heading: 'Reduce Claims',
          text: 'Real-time danger warnings mean fewer accidents. Broker flags mean fewer bad loads. Top-rated stops mean satisfied drivers. This directly impacts your insurance and retention.',
        },
      ],
    },
  },

  // FLEET MEMORY TUTORIALS
  'fleet-memory': {
    dispatcher: {
      title: '🏴 Fleet Memory — Know Before You Assign',
      sections: [
        {
          heading: 'Lookup Any Broker or Shipper',
          text: 'Search for a company name and instantly see: all complaints filed by your fleet, star rating (1-5), pay speed rating, communication rating, detention respect, review comments from other drivers.',
        },
        {
          heading: 'Red Flags',
          text: 'If a broker is rated 1-2 stars, you see a red warning: "Negatively rated." Read the complaints. Do you assign anyway? Or do you call the driver to warn them?',
        },
        {
          heading: 'File a Note',
          text: 'When a driver calls in with a bad experience—slow pay, long detention, rude staff—file a note. Pick the issue type (pay, communication, detention, etc.), set severity, add details. It goes to Fleet Memory.',
        },
        {
          heading: 'Blacklist',
          text: 'The "Flagged Entities" tab shows the worst brokers and shippers by number of flags. Never forget a bad actor.',
        },
      ],
    },
    'owner-op': {
      title: '🏴 Fleet Memory — Before You Accept',
      sections: [
        {
          heading: 'Lookup Shippers & Brokers',
          text: 'Before you accept a load, search the shipper or broker name. See what the community says: pay speed, communication, detention. See specific complaints from other drivers.',
        },
        {
          heading: 'Red = Danger',
          text: 'A red "Negatively rated" banner means this company has multiple low ratings. Read why. Your peers are warning you.',
        },
        {
          heading: 'File Your Own Complaint',
          text: 'Had a bad experience? File a note. Describe what happened, set the severity (critical, high, medium), and help the next driver avoid it.',
        },
        {
          heading: 'Learn from Others',
          text: 'The "Live Intelligence Feed" shows what just happened: new complaints, new bad ratings. Real time. Real drivers.',
        },
      ],
    },
    'fleet-manager': {
      title: '🏴 Fleet Memory — Your Competitive Intelligence',
      sections: [
        {
          heading: 'Cross-Fleet Data',
          text: 'Every complaint, rating, and warning from every subscriber is here. You see patterns faster than your competitors. Bad shipper? You know. Good stop? You know.',
        },
        {
          heading: 'Rate & Review',
          text: 'Rate shippers and brokers based on your fleet's experience. These ratings feed back to every driver, protecting your industry.',
        },
        {
          heading: 'Dangerous Routes',
          text: 'Community reports warn about bad roads: snow, accidents, unsafe areas. When a route gets multiple reports, it goes into the "Road Danger" tab of the Entitled Index.',
        },
        {
          heading: 'Protect Your Drivers',
          text: 'File notes on bad actors. Your fleet's voice gets heard. Other drivers avoid the same pitfalls.',
        },
      ],
    },
  },

  // RIG BUCKS TUTORIALS
  'rig-bucks': {
    'owner-op': {
      title: '💰 Rig Bucks — Rewards for Owner-Operators',
      sections: [
        {
          heading: 'What Rig Bucks Is',
          text: 'As a solo 1099 operator, every load, every service, every stop earns you Rig Bucks. Cash back on fuel, maintenance rebates, bonus rewards. Automatic.',
        },
        {
          heading: 'How You Earn',
          text: 'Load accepted? +points. Fuel purchased? +rebate. Maintenance logged? +credit. The more you use the platform, the more you earn.',
        },
        {
          heading: 'Redeem Instantly',
          text: 'Convert Rig Bucks to cash, fuel credits, tire discounts, or repair shop rebates. No waiting, no hidden terms.',
        },
        {
          heading: 'Not for Fleet Drivers',
          text: 'Rig Bucks is for independent owner-operators only. Company drivers work for fleets; fleets manage their own incentives.',
        },
      ],
    },
  },

  // SUBSCRIPTION SEATS TUTORIALS
  'subscription-seats': {
    'fleet-manager': {
      title: '🎯 Subscription Seats — Manage Driver Access',
      sections: [
        {
          heading: 'How Seats Work',
          text: 'Each DAT and Uber Freight subscription comes with 2 included driver seats. Each driver login counts as one seat. Add a third driver? Upgrade to 3 seats at $15/seat/month.',
        },
        {
          heading: 'Add a Driver',
          text: 'Add a driver's name or email. They get instant access to that load board. The seat counter updates. You're charged only for active, added seats.',
        },
        {
          heading: 'Monitor Usage',
          text: 'See the usage bar fill as drivers log in. When you hit the limit, a prompt appears: upgrade or swap out a driver.',
        },
        {
          heading: 'Cost Control',
          text: 'You see exactly how much each additional seat costs. Budget transparently. No surprises.',
        },
      ],
    },
  },

  // DISPATCH TUTORIALS
  'dispatch': {
    dispatcher: {
      title: '📦 Dispatch — Assign Smart, Protect Your Drivers',
      sections: [
        {
          heading: 'Assign a Load',
          text: 'Pick a load from your board. Select a driver. When you enter the broker or shipper name, the system instantly checks Fleet Memory.',
        },
        {
          heading: 'Broker Flags Show Up Immediately',
          text: 'If that broker is flagged for slow pay or other issues, you see a red warning right there. You can reassign, call the driver to warn them, or explain why you're assigning anyway.',
        },
        {
          heading: 'Driver Sees the Warning Too',
          text: 'The driver gets the same flag alert on their load. They know what they're walking into.',
        },
        {
          heading: 'Reduce Bad Load Assignments',
          text: 'Flags don't block you—they inform you. You stay in control. But you're making decisions with real data.',
        },
      ],
    },
  },

  // WORKFLOW STREAMLINER TUTORIALS
  'workflow-streamliner': {
    dispatcher: {
      title: '⚡ Workflow Streamliner — Model Your Dispatch Operation',
      sections: [
        {
          heading: 'What It Does',
          text: 'Pick "Dispatch & Load Management" and model your operation step-by-step. Assign owners, set KPIs, flag bottlenecks, mark automation opportunities. Get a 0-100 score.',
        },
        {
          heading: 'Score 0-100',
          text: 'As you fill in steps, mark them complete, and show automation, your score rises. 100 means a fully optimized, measured, automated dispatch operation.',
        },
        {
          heading: 'AI Analysis',
          text: 'Run AI analysis and get specific insights: where you're losing time, where automation saves money, which steps are missing KPIs, what\'s slowing you down most.',
        },
        {
          heading: 'Make It Real',
          text: 'Use the model as your roadmap. Automate the highest-impact steps first. Track progress.',
        },
      ],
    },
    'fleet-manager': {
      title: '⚡ Workflow Streamliner — Run a Smarter Fleet',
      sections: [
        {
          heading: 'Model Any Operation',
          text: 'Pick from 8 templates: Dispatch, Driver Ops, Compliance, Finance, Maintenance, Sales, HR, or custom. Each one is pre-built with best-practice steps.',
        },
        {
          heading: 'Assign & Measure',
          text: 'Every step gets an owner, a KPI, a frequency, and automation flags. You're building accountability and measurability into your ops.',
        },
        {
          heading: 'Get Insights',
          text: 'AI reads your model and tells you: which bottlenecks cost the most, which steps to automate first, where you have gaps, what\'s your highest-impact move.',
        },
        {
          heading: 'Track Progress',
          text: 'Mark steps complete. Watch your model score rise. Your operation gets smarter every week.',
        },
      ],
    },
  },

  // COMMAND CENTER TUTORIALS
  'command-center': {
    dispatcher: {
      title: '🎮 Command Center — Your Fleet Dashboard',
      sections: [
        {
          heading: 'One Place, Everything',
          text: 'Active loads, your members, intelligence strips showing broker flags and top stops. Driver alerts from Road Context. Entitled Index with operations, staff alerts, activity logs.',
        },
        {
          heading: 'Real-Time Alerts',
          text: 'Driver alerts show immediately. Danger reports bubble up. Broker flags are visible. You stay ahead.',
        },
        {
          heading: 'Quick Actions',
          text: 'Click "Monitor" to open Road Context. Click "View All" to deep-dive into Fleet Memory. Click "Manage" to update subscriptions.',
        },
        {
          heading: 'Entitled Index',
          text: 'Your master operations hub. 55+ modules connected. See staff alerts, activity across your entire platform, and navigate to any part of your fleet system.',
        },
      ],
    },
  },

  // LOAD BOARD TUTORIALS
  'load-board': {
    dispatcher: {
      title: '📋 Load Board — Post & Track',
      sections: [
        {
          heading: 'Post a Load',
          text: 'Origin, destination, rate, weight, commodity. When you enter a shipper name, you see ratings and warnings instantly.',
        },
        {
          heading: 'No Response?',
          text: 'A load sits unclaimed? Click "No Response — Follow Up" and get a ready-to-send script. Copy it, call the broker, or email. Track who you've followed up with.',
        },
        {
          heading: 'Broker Alerts',
          text: 'Run "Broker Alerts" and the AI analyzes your board: stalled loads, low rates killing response time, ghosting patterns, high-value lanes. Get a script for each situation.',
        },
        {
          heading: 'Auto-Run',
          text: 'Turn on the scheduler. Every 24 hours, the agent re-analyzes and has fresh messages ready. You never miss a trend.',
        },
      ],
    },
  },
};

/**
 * Get tutorial for a module, role, and section
 */
export const getTutorial = (module, userType, section = 0) => {
  const moduleTutorials = tutorials[module];
  if (!moduleTutorials) return null;

  const roleTutorial = moduleTutorials[userType];
  if (!roleTutorial) return null;

  return {
    title: roleTutorial.title,
    section: roleTutorial.sections[section] || null,
    totalSections: roleTutorial.sections.length,
    currentSection: section + 1,
  };
};

/**
 * Get all sections for a tutorial
 */
export const getTutorialSections = (module, userType) => {
  const moduleTutorials = tutorials[module];
  if (!moduleTutorials) return [];

  const roleTutorial = moduleTutorials[userType];
  if (!roleTutorial) return [];

  return roleTutorial.sections;
};

export default tutorials;
