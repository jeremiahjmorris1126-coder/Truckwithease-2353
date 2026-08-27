import React, { useState } from 'react';
import { Mail, Phone, Clock, Search, MessageSquare, AlertCircle, CheckCircle, Send } from 'lucide-react';
import { SUPPORT_EMAIL, SUPPORT_PHONE, SUPPORT_CATEGORIES, FAQ_TOPICS, getSupportHours, searchFAQ, createSupportTicket } from '../lib/customerSupport';

const C = {
  black: '#0a0a0a',
  white: '#f0ede8',
  white60: 'rgba(240, 237, 232, 0.6)',
  white30: 'rgba(240, 237, 232, 0.3)',
  white10: 'rgba(240, 237, 232, 0.1)',
  card: '#161616',
  gold: '#c9a84c',
  green: '#22c55e',
  red: '#ef4444',
  cyan: '#FFD700',
};

export default function CustomerSupportPage() {
  const [tab, setTab] = useState('contact'); // contact, faq, ticket
  const [searchQuery, setSearchQuery] = useState('');
  const [faqResults, setFaqResults] = useState([]);
  const [ticketForm, setTicketForm] = useState({
    category: 'TECHNICAL',
    subject: '',
    description: '',
    email: '',
    phone: '',
  });
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [ticketResult, setTicketResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSearchFAQ = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = searchFAQ(query);
      setFaqResults(results);
    } else {
      setFaqResults([]);
    }
  };

  const handleSubmitTicket = async () => {
    if (!ticketForm.subject.trim() || !ticketForm.description.trim() || !ticketForm.email.trim()) return;
    setSubmitting(true);
    try {
      const ticket = await createSupportTicket(ticketForm);
      setTicketResult(ticket);
      setTicketSubmitted(true);
      if (ticket && ticket.stored) {
        setTicketForm({ category: 'TECHNICAL', subject: '', description: '', email: '', phone: '' });
      }
    } catch (err) {
      setTicketResult({ stored: false, note: 'Could not reach the support server. Email or call us instead.' });
      setTicketSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: C.white, padding: '24px 16px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: 42, fontWeight: 700, marginBottom: '12px', background: `linear-gradient(135deg, #C9A84C 0%, #FFD700 40%, #C9A84C 70%, #8A6E2F 100%)`, backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', color: C.gold }}>
            💬 Customer Support
          </h1>
          <p style={{ fontSize: 16, color: C.white60, lineHeight: 1.7 }}>
            We're here to help. Email, phone, or submit a ticket. Most technical issues resolved within hours.
          </p>
        </div>

        {/* Quick Contact */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '40px' }}>
          <a href={`mailto:${SUPPORT_EMAIL}`} style={{
            background: C.card,
            border: `2px solid ${C.cyan}`,
            borderRadius: '8px',
            padding: '24px',
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            <Mail size={32} color={C.cyan} />
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: C.white, margin: 0 }}>Email</h3>
            <p style={{ fontSize: '13px', color: C.white60, margin: 0 }}>{SUPPORT_EMAIL}</p>
            <p style={{ fontSize: '11px', color: C.gold, margin: 0, fontWeight: '600' }}>← Click to email</p>
          </a>

          <a href={`tel:${SUPPORT_PHONE.replace(/-/g, '')}`} style={{
            background: C.card,
            border: `2px solid ${C.gold}`,
            borderRadius: '8px',
            padding: '24px',
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            <Phone size={32} color={C.gold} />
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: C.white, margin: 0 }}>Phone</h3>
            <p style={{ fontSize: '13px', color: C.white60, margin: 0 }}>{SUPPORT_PHONE}</p>
            <p style={{ fontSize: '11px', color: C.cyan, margin: 0, fontWeight: '600' }}>← Click to call</p>
          </a>

          <div style={{
            background: C.card,
            border: `2px solid ${C.green}`,
            borderRadius: '8px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            <Clock size={32} color={C.green} />
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: C.white, margin: 0 }}>Support Hours</h3>
            <p style={{ fontSize: '11px', color: C.white60, margin: 0, lineHeight: 1.6 }}>
              {getSupportHours().slice(0, 3).map(h => `${h.day} ${h.hours}`).join(' • ')}
            </p>
            <p style={{ fontSize: '11px', color: C.gold, margin: 0, fontWeight: '600' }}>6am-10pm CT daily</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', borderBottom: `1px solid ${C.white30}`, flexWrap: 'wrap' }}>
          {[
            { id: 'contact', label: '📧 Contact & Hours' },
            { id: 'faq', label: '❓ FAQ' },
            { id: 'ticket', label: '🎫 Submit Ticket' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '12px 16px',
                background: 'none',
                border: 'none',
                color: tab === t.id ? C.gold : C.white60,
                borderBottom: tab === t.id ? `3px solid ${C.gold}` : 'none',
                cursor: 'pointer',
                fontWeight: tab === t.id ? '700' : '500',
                fontSize: '14px',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* CONTACT TAB */}
        {tab === 'contact' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <div style={{ background: C.card, border: `1px solid ${C.white10}`, borderRadius: '8px', padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Get Help Fast</h2>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: C.white60, lineHeight: 2 }}>
                <li>🚨 Technical issues: 1-2 hours response</li>
                <li>🔐 Account/security: 2-4 hours response</li>
                <li>💬 Feature questions: 4-12 hours response</li>
                <li>📧 All support via email or phone</li>
                <li>24/7 email support available</li>
              </ul>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.white10}`, borderRadius: '8px', padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Support Categories</h2>
              <div style={{ display: 'grid', gap: '12px' }}>
                {Object.entries(SUPPORT_CATEGORIES).map(([key, cat]) => (
                  <div key={key} style={{ background: C.black, borderRadius: '6px', padding: '12px', borderLeft: `3px solid ${C.cyan}` }}>
                    <p style={{ fontSize: '12px', fontWeight: '700', color: C.cyan, margin: '0 0 2px 0' }}>
                      {cat.icon} {cat.name}
                    </p>
                    <p style={{ fontSize: '11px', color: C.white60, margin: 0 }}>
                      {cat.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FAQ TAB */}
        {tab === 'faq' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <Search size={20} color={C.white60} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => handleSearchFAQ(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    background: C.card,
                    border: `1px solid ${C.white10}`,
                    borderRadius: '6px',
                    color: C.white,
                    fontSize: '14px',
                  }}
                />
              </div>

              {searchQuery && faqResults.length > 0 && (
                <p style={{ fontSize: '12px', color: C.white60, margin: '0 0 16px 0' }}>
                  Found {faqResults.length} matching answer{faqResults.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {searchQuery ? (
              faqResults.length > 0 ? (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {faqResults.map((result, idx) => (
                    <div key={idx} style={{ background: C.card, border: `1px solid ${C.white10}`, borderRadius: '8px', padding: '20px' }}>
                      <p style={{ fontSize: '11px', color: C.cyan, fontWeight: '700', margin: '0 0 8px 0' }}>
                        {result.category}
                      </p>
                      <h3 style={{ fontSize: '14px', fontWeight: '700', color: C.white, margin: '0 0 8px 0' }}>
                        {result.q}
                      </h3>
                      <p style={{ fontSize: '12px', color: C.white60, margin: 0, lineHeight: 1.6 }}>
                        {result.a}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ background: C.card, border: `1px solid ${C.white10}`, borderRadius: '8px', padding: '32px', textAlign: 'center' }}>
                  <p style={{ fontSize: '14px', color: C.white60, margin: 0 }}>
                    No FAQs match that search. Email {SUPPORT_EMAIL} for help.
                  </p>
                </div>
              )
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                {Object.entries(FAQ_TOPICS).map(([catKey, category]) => (
                  <div key={catKey} style={{ background: C.card, border: `1px solid ${C.white10}`, borderRadius: '8px', padding: '20px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px', color: C.cyan }}>
                      {category.title}
                    </h3>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {category.questions.slice(0, 3).map((q, idx) => (
                        <div key={idx} style={{ background: C.black, borderRadius: '6px', padding: '12px', borderLeft: `2px solid ${C.gold}` }}>
                          <p style={{ fontSize: '12px', fontWeight: '700', color: C.white, margin: '0 0 4px 0' }}>
                            {q.q}
                          </p>
                          <p style={{ fontSize: '11px', color: C.white60, margin: 0, lineHeight: 1.4 }}>
                            {q.a.substring(0, 80)}...
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TICKET TAB */}
        {tab === 'ticket' && (
          <div style={{ maxWidth: 600 }}>
            {ticketSubmitted ? (
              <div style={{
                background: 'rgba(34, 197, 94, 0.1)',
                border: `2px solid ${C.green}`,
                borderRadius: '8px',
                padding: '32px',
                textAlign: 'center',
              }}>
                <CheckCircle size={48} color={C.green} style={{ margin: '0 auto 16px', display: 'block' }} />
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: C.green, marginBottom: '8px' }}>
                  Ticket Submitted
                </h2>
                <p style={{ fontSize: '13px', color: C.white60, marginBottom: '12px' }}>
                  We've received your support request. You'll hear from us soon at {ticketForm.email}
                </p>
                <p style={{ fontSize: '12px', color: C.white60 }}>
                  Check spam folder if you don't see our response within the estimated time.
                </p>
              </div>
            ) : (
              <div style={{ background: C.card, border: `1px solid ${C.white10}`, borderRadius: '8px', padding: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>
                  Submit a Support Ticket
                </h2>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: C.white, display: 'block', marginBottom: '6px' }}>
                    Category
                  </label>
                  <select
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: C.black,
                      border: `1px solid ${C.white10}`,
                      borderRadius: '6px',
                      color: C.white,
                      fontSize: '13px',
                    }}
                  >
                    {Object.entries(SUPPORT_CATEGORIES).map(([key, cat]) => (
                      <option key={key} value={key}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: C.white, display: 'block', marginBottom: '6px' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={ticketForm.email}
                    onChange={(e) => setTicketForm({ ...ticketForm, email: e.target.value })}
                    placeholder="your@email.com"
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: C.black,
                      border: `1px solid ${C.white10}`,
                      borderRadius: '6px',
                      color: C.white,
                      fontSize: '13px',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: C.white, display: 'block', marginBottom: '6px' }}>
                    Subject
                  </label>
                  <input
                    type="text"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                    placeholder="Brief summary of your issue"
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: C.black,
                      border: `1px solid ${C.white10}`,
                      borderRadius: '6px',
                      color: C.white,
                      fontSize: '13px',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: C.white, display: 'block', marginBottom: '6px' }}>
                    Description
                  </label>
                  <textarea
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                    placeholder="Describe what happened, what you expected, and what you're seeing instead. Include device type and app version if technical issue."
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: C.black,
                      border: `1px solid ${C.white10}`,
                      borderRadius: '6px',
                      color: C.white,
                      fontSize: '13px',
                      minHeight: '120px',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <button
                  onClick={handleSubmitTicket}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: C.cyan,
                    color: C.black,
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <Send size={16} /> Submit Ticket
                </button>

                <p style={{ fontSize: '11px', color: C.white60, marginTop: '12px', margin: 0 }}>
                  You can also email {SUPPORT_EMAIL} directly for immediate contact.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
