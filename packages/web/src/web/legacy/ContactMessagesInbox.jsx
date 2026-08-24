import { useState, useEffect } from 'react';
import { Trash2, ExternalLink, Phone, Mail } from 'lucide-react';
import PocketBase from 'pocketbase';

const pb = new PocketBase();

const NAVY = '#1e3a5f';
const ORANGE = '#f59e0b';
const GREEN = '#10b981';

export default function ContactMessagesInbox() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMsg, setSelectedMsg] = useState(null);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadMessages = async () => {
    try {
      const records = await pb.collection('contact_messages').getFullList({
        sort: '-created',
      });
      setMessages(records);
      setError('');
    } catch (err) {
      setError('Failed to load messages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await pb.collection('contact_messages').delete(id);
      setMessages(messages.filter(m => m.id !== id));
      setSelectedMsg(null);
    } catch (err) {
      alert('Failed to delete message');
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: 16, color: '#666' }}>Loading messages...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', minHeight: '600px' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: NAVY, marginBottom: 8 }}>Contact Messages</h1>
        <p style={{ color: '#666', fontSize: 15 }}>
          {messages.length} message{messages.length !== 1 ? 's' : ''} received
        </p>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: 16, marginBottom: 24, color: '#c41c1c', fontSize: 14 }}>
          {error}
        </div>
      )}

      {messages.length === 0 ? (
        <div style={{ background: '#f9fafb', border: '2px dashed #d1d5db', borderRadius: 12, padding: 60, textAlign: 'center' }}>
          <p style={{ fontSize: 16, color: '#999', marginBottom: 8 }}>No messages yet</p>
          <p style={{ fontSize: 13, color: '#bbb' }}>When fleet managers submit the contact form, they'll appear here</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Messages List */}
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.map(msg => (
                <div
                  key={msg.id}
                  onClick={() => setSelectedMsg(msg)}
                  style={{
                    background: selectedMsg?.id === msg.id ? NAVY : '#f9fafb',
                    border: selectedMsg?.id === msg.id ? `2px solid ${ORANGE}` : '1px solid #e5e7eb',
                    borderRadius: 8,
                    padding: 16,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    if (selectedMsg?.id !== msg.id) {
                      e.currentTarget.style.background = '#f3f4f6';
                      e.currentTarget.style.borderColor = '#d1d5db';
                    }
                  }}
                  onMouseLeave={e => {
                    if (selectedMsg?.id !== msg.id) {
                      e.currentTarget.style.background = '#f9fafb';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                    <div>
                      <p style={{ fontWeight: 700, color: selectedMsg?.id === msg.id ? 'white' : NAVY, fontSize: 15, marginBottom: 2 }}>
                        {msg.name}
                      </p>
                      <p style={{ fontSize: 13, color: selectedMsg?.id === msg.id ? '#cbd5e1' : '#666' }}>
                        {msg.email}
                      </p>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: selectedMsg?.id === msg.id ? '#94a3b8' : '#999' }}>
                    {formatDate(msg.created)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Message Detail */}
          {selectedMsg && (
            <div style={{ background: 'white', border: `2px solid ${ORANGE}`, borderRadius: 12, padding: 24, height: 'fit-content', position: 'sticky', top: 20 }}>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: NAVY, marginBottom: 12 }}>
                  {selectedMsg.name}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                  <a href={`mailto:${selectedMsg.email}`} style={{ display: 'flex', alignItems: 'center', gap: 8, color: ORANGE, textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>
                    <Mail size={16} />
                    {selectedMsg.email}
                  </a>
                  <div style={{ fontSize: 12, color: '#999' }}>
                    Received: {formatDate(selectedMsg.created)}
                  </div>
                </div>

                <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 20 }}>
                  <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {selectedMsg.message}
                  </p>
                </div>

                <button
                  onClick={() => deleteMessage(selectedMsg.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '12px 16px',
                    background: '#fee2e2',
                    border: '1px solid #fca5a5',
                    borderRadius: 8,
                    color: '#c41c1c',
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fecaca'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fee2e2'}
                >
                  <Trash2 size={16} />
                  Delete Message
                </button>
              </div>

              <div style={{ background: '#eff6ff', border: `1px solid #bfdbfe`, borderRadius: 8, padding: 16 }}>
                <p style={{ fontSize: 12, color: '#1e40af', fontWeight: 700, marginBottom: 8 }}>💡 Quick Actions</p>
                <p style={{ fontSize: 13, color: '#1e40af', lineHeight: 1.5 }}>
                  Click the email link above to reply directly, or save their contact info for follow-up.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
