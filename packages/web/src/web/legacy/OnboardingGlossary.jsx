import React, { useState } from 'react';

import { Book, Search, ChevronDown } from "lucide-react";
const colors = {
  navy: '#1e3a5f',
  orange: '#f97316',
  amber: '#f59e0b',
  green: '#10b981',
  darkBg: '#0f172a',
};

const acronyms = {
  'Compliance Terms': [
    { term: 'HOS', full: 'Hours of Service', def: 'Federal rules limiting how long drivers can work without breaks. 11-hour driving limit, 10-hour minimum off-duty period.', role: 'driver' },
    { term: 'ELD', full: 'Electronic Logging Device', def: 'Mandated device that tracks HOS automatically. Required on all commercial trucks.', role: 'driver' },
    { term: 'DVIR', full: 'Driver Vehicle Inspection Report', def: 'Daily safety check before driving. Driver logs defects; repairs must be completed before next use.', role: 'driver' },
    { term: 'DOT', full: 'Department of Transportation', def: 'Federal agency that sets trucking safety regulations. FMCSA enforces them.', role: 'both' },
    { term: 'FMCSA', full: 'Federal Motor Carrier Safety Administration', def: 'Oversees commercial trucking safety. Sets HOS rules, safety standards, compliance requirements.', role: 'both' },
    { term: 'CSA', full: 'Carrier Safety Authorities (formerly Unsafe Driving)', def: 'Safety rating system tracking violations, crashes, HOS infractions. Lower is better.', role: 'manager' },
  ],
  'Vehicle Terms': [
    { term: 'GVWR', full: 'Gross Vehicle Weight Rating', def: 'Maximum weight a truck can safely carry, including cargo and fuel. Exceeding it is illegal.', role: 'driver' },
    { term: 'CMV', full: 'Commercial Motor Vehicle', def: 'Any truck over 26,001 GVWR. Subject to DOT regulations and HOS rules.', role: 'both' },
    { term: 'HAZMAT', full: 'Hazardous Materials', def: 'Dangerous goods requiring special endorsements, routing, and safety procedures.', role: 'driver' },
    { term: 'OOS', full: 'Out of Service', def: 'Vehicle or driver declared unsafe to operate until repairs or issues are resolved.', role: 'both' },
  ],
  'Financial Terms': [
    { term: 'Detention', full: 'Detention Time & Pay', def: 'Paid waiting time when loading/unloading takes longer than allowed. Typically $50-$150/hour.', role: 'driver' },
    { term: 'Factoring', full: 'Freight Invoice Factoring', def: 'Sell unpaid invoices to a company for cash upfront (minus a small fee). Get paid same day instead of 30 days.', role: 'manager' },
    { term: 'CSA Score', full: 'Safety Rating Score', def: 'Numerical rating (0-100) of fleet safety. Affects insurance rates and customer confidence.', role: 'manager' },
  ],
  'Operations Terms': [
    { term: 'Load Board', full: 'Load Marketplace', def: 'Digital platform showing available loads. Drivers find and accept freight with rates and details visible.', role: 'driver' },
    { term: 'Dispatch', full: 'Load Assignment', def: 'Process of assigning loads to drivers. Can be manual (fleet manager decides) or automated (AI matches driver to load).', role: 'manager' },
    { term: 'Breakdown', full: 'Vehicle Breakdown', def: 'Unexpected mechanical failure on the road. TruckWithEase locates nearest repair shops and towing.', role: 'driver' },
  ],
};

export default function OnboardingGlossary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [userRole, setUserRole] = useState('both');

  const filteredAcronyms = Object.entries(acronyms).reduce((acc, [category, items]) => {
    const filtered = items.filter(item => {
      const matchesSearch = searchTerm === '' || 
        item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.full.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = userRole === 'both' || item.role === userRole || item.role === 'both';
      return matchesSearch && matchesRole;
    });
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {});

  return (
    <div style={{ background: colors.darkBg, minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{ color: '#fff', fontSize: '2.2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
            <Book style={{ width: '32px', height: '32px', color: colors.orange }} />
            TruckWithEase Glossary
          </h1>
          <p style={{ color: '#94a3b8', margin: 0 }}>Learn every term, acronym, and concept you'll encounter in the app</p>
        </div>

        {/* Search & Filter */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Search acronyms, terms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.75rem',
                background: colors.navy,
                border: `2px solid ${colors.orange}`,
                borderRadius: '0.5rem',
                color: '#fff',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
            style={{
              padding: '0.75rem',
              background: colors.navy,
              border: `2px solid ${colors.orange}`,
              borderRadius: '0.5rem',
              color: '#fff',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            <option value="both">All Roles</option>
            <option value="driver">Driver View</option>
            <option value="manager">Manager View</option>
          </select>
        </div>

        {/* Glossary Categories */}
        <div style={{ display: 'grid', gap: '1rem' }}>
          {Object.entries(filteredAcronyms).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', background: colors.navy, borderRadius: '0.5rem', color: '#94a3b8' }}>
              No terms found matching your search.
            </div>
          ) : (
            Object.entries(filteredAcronyms).map(([category, items]) => (
              <div key={category} style={{ background: colors.navy, borderRadius: '0.5rem', overflow: 'hidden', border: `2px solid ${colors.orange}` }}>
                <button
                  onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: colors.navy,
                    border: 'none',
                    color: colors.orange,
                    fontWeight: '700',
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => e.target.style.background = '#1e3a5f'}
                  onMouseOut={(e) => e.target.style.background = colors.navy}
                >
                  <span>{category}</span>
                  <ChevronDown style={{
                    width: '20px',
                    height: '20px',
                    transform: expandedCategory === category ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.3s'
                  }} />
                </button>

                {expandedCategory === category && (
                  <div style={{ padding: '1rem', borderTop: `1px solid ${colors.orange}` }}>
                    {items.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          marginBottom: idx < items.length - 1 ? '1.5rem' : 0,
                          paddingBottom: idx < items.length - 1 ? '1.5rem' : 0,
                          borderBottom: idx < items.length - 1 ? `1px solid #1e3a5f` : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '0.5rem' }}>
                          <span style={{ color: colors.orange, fontWeight: '800', fontSize: '1.2rem', minWidth: '80px' }}>
                            {item.term}
                          </span>
                          <span style={{ color: colors.amber, fontSize: '0.9rem', fontStyle: 'italic' }}>
                            {item.full}
                          </span>
                        </div>
                        <p style={{ color: '#cbd5e1', margin: '0.5rem 0 0 80px', lineHeight: '1.6', fontSize: '0.95rem' }}>
                          {item.def}
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', marginLeft: '80px' }}>
                          {item.role === 'driver' && <span style={{ background: colors.green, color: '#fff', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: '600' }}>Driver</span>}
                          {item.role === 'manager' && <span style={{ background: colors.orange, color: '#fff', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: '600' }}>Manager</span>}
                          {item.role === 'both' && (
                            <>
                              <span style={{ background: colors.green, color: '#fff', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: '600' }}>Driver</span>
                              <span style={{ background: colors.orange, color: '#fff', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: '600' }}>Manager</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Secure Example Link */}
        <div style={{ marginTop: '2rem', padding: '1.5rem', background: colors.navy, border: `2px dashed ${colors.orange}`, borderRadius: '0.5rem', textAlign: 'center' }}>
          <p style={{ color: '#cbd5e1', margin: '0 0 1rem 0' }}>Need API reference or code examples?</p>
          <a
            href="/static/secure-example.html"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background: colors.orange,
              color: '#fff',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '600',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => e.target.style.opacity = '0.9'}
            onMouseOut={(e) => e.target.style.opacity = '1'}
          >
            View Secure Examples & API Docs
          </a>
        </div>
      </div>
    </div>
  );
}
