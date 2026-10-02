import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

const C = {
  gold: '#c9a84c',
  white: '#f0ede8',
  white60: 'rgba(240, 237, 232, 0.6)',
  card: '#0f1419',
  blue: '#3b82f6',
  black: '#060A10',
};

const contextualHelpText = {
  dispatch: {
    owner_op: {
      title: 'Dispatch - Get Loaded Fast',
      sections: [
        { title: 'What This Does', text: 'See live loads from brokers. Each load shows rate, distance, pickup and delivery times. Accept and get assigned.' },
        { title: 'Broker Flags Matter', text: 'Red warnings under broker names mean that broker is flagged by your fleet community. Check the warning before you accept.' },
        { title: 'Your First Load', text: 'Pick a load, hit Accept, and you get driving directions plus real-time tracking. Rate per mile calculator shows exactly what you earn after fuel and tolls.' },
      ],
    },
    fleet_manager: {
      title: 'Dispatch - Control Your Fleet',
      sections: [
        { title: 'Assign Drivers to Loads', text: 'See all available loads. Pick one, assign to a driver with one tap. Driver gets notification, GPS tracking starts, detention timer runs.' },
        { title: 'Broker Intel', text: 'Orange or red warning means this broker has complaints filed by your fleet. Click to see notes. Payment speed, communication issues, load accuracy problems.' },
        { title: 'Manage Capacity', text: 'See all drivers and trucks at a glance. Assign based on availability. Loads update in real time as drivers change status.' },
      ],
    },
  },
  'load-board': {
    owner_op: {
      title: 'Load Board - Find Your Next Load',
      sections: [
        { title: 'Filter by What Matters', text: 'Lane, weight, equipment type, rate. Refine until you see loads worth your time. Save searches so you can reload them next time.' },
        { title: 'Shipper and Broker Ratings', text: 'Every shipper or broker shows a community rating. Green means good pay or communication. Red means flagged. Read the notes before you apply.' },
        { title: 'Your First Claim', text: 'Find a load, hit Claim. Broker gets notified. They will accept or reject within a few minutes. You will see live messages in the Dispatch tab.' },
      ],
    },
    fleet_manager: {
      title: 'Load Board - Manage Multiple Drivers',
      sections: [
        { title: 'Post Your Truck Capacity', text: 'Tell the load board how much you can move. Equipment type, rate range, preferred lanes. Brokers see you and reach out directly.' },
        { title: 'DAT and Uber Freight Seats', text: 'Each subscription includes 2 login seats per service. Manage driver logins at Settings. Going over Upgrade for 15 dollars per seat per month.' },
        { title: 'Track Claims Across Drivers', text: 'See which driver claimed which load, status updates, delivery confirmations. All in one place.' },
      ],
    },
  },
  'fleet-memory': {
    owner_op: {
      title: 'Fleet Memory - Your Collective Intelligence',
      sections: [
        { title: 'Community Ratings', text: 'See what other owner-ops in your fleet think about brokers and shippers. Pay speed, communication, load accuracy. All rated honestly.' },
        { title: 'Danger Reports', text: 'Community confirms dangerous roads, weigh station setups, police patterns. Before you take a route, check for warnings.' },
        { title: 'Your Feedback', text: 'Rate charge stops, file complaints about shippers. Help your whole fleet make smarter decisions.' },
      ],
    },
    fleet_manager: {
      title: 'Fleet Memory - Operational Intelligence',
      sections: [
        { title: 'Entity Blacklist', text: 'See which brokers or shippers your fleet has flagged. Total complaints, severity level, specific issues. Use this to stop bad loads before assignment.' },
        { title: 'Top Charge Stops Fleet-Wide', text: 'Your drivers have rated stops. See which ones rank highest for each vehicle type. Route drivers there to save time and increase satisfaction.' },
        { title: 'Broker Ratings and Trends', text: 'Track broker performance over time. If a brokers communication drops or they are ghosting more loads, the intelligence captures it.' },
      ],
    },
  },
  'workflow-streamliner': {
    fleet_manager: {
      title: 'Workflow Streamliner - Model and Automate Operations',
      sections: [
        { title: 'What to Model', text: 'Pick an operation. Dispatch, Driver Ops, Finance, Compliance, HR. Break it into step by step processes. Assign owners, set KPIs, mark what is automated.' },
        { title: 'Model Score Ring', text: 'As you complete steps and automate processes, your Model Score climbs. Fully automated, fully owned, fully measured equals 100. This is your operational health.' },
        { title: 'AI Insights', text: 'Run analysis and get honest findings. Bottleneck steps, automation gaps that save money, unmeasured KPIs, long cycle steps blocking cash. Prioritized by impact.' },
      ],
    },
    owner_op: {
      title: 'Workflow Streamliner - Simplify Your Business',
      sections: [
        { title: 'Your Solo Operation', text: 'Model your process. Dispatch messaging, fuel stops, load tracking, payment follow up. Even a solo operation has workflows that can be streamlined.' },
        { title: 'Automation Ideas', text: 'AI suggests automation for each step. Auto reply scripts, load status alerts, fuel stop routing. Implement what makes sense.' },
        { title: 'Track What Matters', text: 'Set one KPI per step. Average dispatch response time, fuel spend per mile, payment collection days. Watch the trend week to week.' },
      ],
    },
  },
  'road-context': {
    owner_op: {
      title: 'Road Context - Survival Toolkit on the Road',
      sections: [
        { title: 'Live Danger Reports', text: 'See dangerous roads, weather, weigh station activity, police patterns. All for your current location and route ahead. Community reports, verified confidence voting.' },
        { title: 'Broker Flags in Real Time', text: 'Your current load shows the brokers rating and any fleet complaints about them. Know what you are delivering for before you arrive.' },
        { title: 'Top Charge Stops Ahead', text: 'Ranked by your fleets ratings for your vehicle type. Best fuel, best service, best reputation. Route to them and save time.' },
      ],
    },
  },
  'subscription-seats': {
    fleet_manager: {
      title: 'Subscription Seats - Control Load Board Access',
      sections: [
        { title: 'Your Seat Limit', text: 'Each subscription includes 2 logins per load board service. Add drivers and they use a login seat. Going over triggers upgrade prompt.' },
        { title: 'Adding Drivers', text: 'Search driver by name or email. Add them to DAT, Uber Freight, or both. They get access instantly. Remove them anytime and free up a seat.' },
        { title: 'Upgrade Path', text: 'Hit your limit Upgrade to 3, 4, or 5 seats per service at 15 dollars per seat per month. Billed to your fleet subscription.' },
      ],
    },
  },
};

export default function ContextualHelp({ module, userType = 'owner_op' }) {
  const [expanded, setExpanded] = useState(false);
  const [expandedSection, setExpandedSection] = useState(0);

  const helpKey = module.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const helpData = contextualHelpText[helpKey]?.[userType];

  if (!helpData) return null;

  return (
    <div style={{
      padding: '16px',
      background: C.card,
      border: `1px solid rgba(201, 168, 76, 0.15)`,
      borderRadius: 8,
      marginBottom: '16px',
    }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          width: '100%',
          background: 'none',
          border: 'none',
          color: C.gold,
          cursor: 'pointer',
          padding: 0,
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        <HelpCircle size={18} />
        {helpData.title}
        <ChevronDown
          size={16}
          style={{ marginLeft: 'auto', transition: 'transform 0.3s', transform: expanded ? 'rotate(180deg)' : 'rotate(0)' }}
        />
      </button>

      {expanded && (
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: `1px solid rgba(201, 168, 76, 0.1)` }}>
          {helpData.sections.map((section, idx) => (
            <div key={idx} style={{ marginBottom: '12px' }}>
              <button
                onClick={() => setExpandedSection(expandedSection === idx ? -1 : idx)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  color: C.white,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  padding: 0,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                {section.title}
                <ChevronDown
                  size={14}
                  style={{ transition: 'transform 0.3s', transform: expandedSection === idx ? 'rotate(180deg)' : 'rotate(0)' }}
                />
              </button>
              {expandedSection === idx && (
                <div style={{ color: C.white60, fontSize: 12, marginTop: '8px', lineHeight: 1.5 }}>
                  {section.text}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
