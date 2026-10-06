/**
 * Customer Support System
 * Help center, contact forms, issue tracking, service categories
 */

export const SUPPORT_EMAIL = 'truckeasecare@gmail.com';
export const SUPPORT_PHONE = '1-800-TRUCK-EASE'; // 1-800-878-2532
export const SUPPORT_HOURS = {
  mon: '6am-10pm CT',
  tue: '6am-10pm CT',
  wed: '6am-10pm CT',
  thu: '6am-10pm CT',
  fri: '6am-10pm CT',
  sat: '7am-9pm CT',
  sun: '8am-8pm CT',
};

export const SUPPORT_CATEGORIES = {
  TECHNICAL: {
    name: 'Technical Issues',
    icon: '⚙️',
    description: 'App crashes, features not working, login problems',
    responseTime: '1-2 hours',
    priority: 'high',
  },
  ACCOUNT: {
    name: 'Account & Login',
    icon: '🔐',
    description: 'Password reset, account recovery, profile issues',
    responseTime: '2-4 hours',
    priority: 'high',
  },
  BILLING: {
    name: 'Billing & Subscription',
    icon: '💳',
    description: 'Payment issues, subscription changes, invoices',
    responseTime: '4-8 hours',
    priority: 'medium',
  },
  DATA: {
    name: 'Data & Privacy',
    icon: '🔒',
    description: 'Data access, privacy concerns, GDPR/CCPA requests',
    responseTime: '24-48 hours',
    priority: 'high',
  },
  FEATURES: {
    name: 'Feature Questions',
    icon: '❓',
    description: 'How to use features, tutorials, best practices',
    responseTime: '4-12 hours',
    priority: 'low',
  },
  FEEDBACK: {
    name: 'Feedback & Suggestions',
    icon: '💡',
    description: 'Feature requests, app improvements, suggestions',
    responseTime: '1-2 business days',
    priority: 'low',
  },
  ACCESSIBILITY: {
    name: 'Accessibility Support',
    icon: '♿',
    description: 'Screen reader issues, captions, deaf/blind features',
    responseTime: '1-2 hours',
    priority: 'critical',
  },
};

export const FAQ_TOPICS = {
  GETTING_STARTED: {
    title: 'Getting Started',
    questions: [
      {
        q: 'How do I sign up for TruckWithEase?',
        a: 'Go to the signup page, choose your user type (Solo Driver, Dispatcher, Fleet Manager), enter your email and create a password. You\'ll get instant access to the platform.',
      },
      {
        q: 'What\'s included with my subscription?',
        a: 'All subscriptions include: Road Context, Fleet Memory, Dispatch, Load Board, HOS Logging, Reports, and more. Owner-ops get Rig Bucks. Seat upgrades available for DAT/Uber Freight logins.',
      },
      {
        q: 'Can I download the app?',
        a: 'The app works on any device in your browser. Android native app available on Google Play. iOS app coming soon. No download needed to start using web version.',
      },
    ],
  },
  TECHNICAL_HELP: {
    title: 'Technical Help',
    questions: [
      {
        q: 'The app keeps crashing. What do I do?',
        a: 'Try: 1) Clear browser cache, 2) Use a different browser, 3) Restart your device, 4) Check internet connection. If it persists, email truckeasecare@gmail.com with your issue and device type.',
      },
      {
        q: 'I can\'t log in. How do I reset my password?',
        a: 'Click "Forgot Password" on the login page. Enter your email. You\'ll get a link to reset your password within 5 minutes. Check spam folder if you don\'t see it.',
      },
      {
        q: 'GPS location isn\'t working. Why?',
        a: 'Make sure: 1) Location permission is enabled in app, 2) GPS is on (not just WiFi), 3) You\'re outdoors with clear sky, 4) App has internet connection. Restart app if still not working.',
      },
      {
        q: 'My phone keeps saying low battery when using Road Context. Why?',
        a: 'Real-time GPS and audio use significant battery. Turn on Battery Saver mode. Dim screen. Close other apps. Use while plugged in if on long drives.',
      },
    ],
  },
  ACCOUNT: {
    title: 'Account & Subscription',
    questions: [
      {
        q: 'How do I upgrade my plan?',
        a: 'Go to Account Settings > Subscription. See available plans. Choose seats/features needed. Payment processes instantly. New features available right away.',
      },
      {
        q: 'Can I cancel anytime?',
        a: 'Yes. Month-to-month plans cancel immediately with no penalty. You keep access through the end of your billing period. Annual plans have 30-day cancellation window.',
      },
      {
        q: 'Is my data safe?',
        a: 'Yes. We use bank-level encryption (AES-256), secure servers, automatic backups, and comply with GDPR/CCPA. Your data is never sold.',
      },
    ],
  },
  FEATURES: {
    title: 'Feature Questions',
    questions: [
      {
        q: 'How does Road Context work?',
        a: 'Road Context shows your real-time location, current load, nearby danger reports, top-rated fuel stops, broker warnings, and weather alerts. All in one view.',
      },
      {
        q: 'What are Rig Bucks?',
        a: 'Owner-operator rewards. Earn fuel credits, maintenance rebates, cash back on partner services. Only available to solo owner-ops.',
      },
      {
        q: 'Can my fleet use this?',
        a: 'Yes. Create a Fleet account, add drivers, manage DAT/Uber Freight seats, view fleet-wide reports, and coordinate dispatch. See Subscription Seats for seat pricing.',
      },
    ],
  },
};

/**
 * Create support ticket
 */
export function createSupportTicket(ticket) {
  return {
    id: `ticket-${Date.now()}`,
    ...ticket,
    status: 'open',
    createdAt: new Date(),
    updatedAt: new Date(),
    responses: [],
  };
}

/**
 * Get support email
 */
export function getSupportEmail() {
  return SUPPORT_EMAIL;
}

/**
 * Get support hours formatted
 */
export function getSupportHours() {
  const daysInOrder = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  return daysInOrder.map(day => ({
    day: day.charAt(0).toUpperCase() + day.slice(1),
    hours: SUPPORT_HOURS[day],
  }));
}

/**
 * Check if support is currently available
 */
export function isSupportAvailable() {
  const now = new Date();
  const dayName = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][now.getDay()];
  
  // In production, parse actual hours and check against current time
  // For now, return true (24/7 email support)
  return true;
}

/**
 * Get FAQ by category
 */
export function getFAQByCategory(category) {
  return FAQ_TOPICS[category];
}

/**
 * Search FAQ by keyword
 */
export function searchFAQ(keyword) {
  const results = [];
  const lowerKeyword = keyword.toLowerCase();
  
  Object.entries(FAQ_TOPICS).forEach(([categoryKey, category]) => {
    category.questions.forEach((question) => {
      if (
        question.q.toLowerCase().includes(lowerKeyword) ||
        question.a.toLowerCase().includes(lowerKeyword)
      ) {
        results.push({
          category: category.title,
          ...question,
        });
      }
    });
  });
  
  return results;
}
