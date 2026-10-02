import { useState, useEffect } from 'react';
import { pb } from '../lib/pb';

const GOLD = '#c9a84c';
const DARK = '#060A10';
const DARK2 = '#0d1420';
const GREEN = '#22c55e';
const RED = '#ef4444';
const BLUE = '#3b82f6';
const WHITE = '#ffffff';

export default function SubscriptionSeatsPage() {
  const [subscription, setSubscription] = useState(null);
  const [datUsers, setDatUsers] = useState([]);
  const [uberUsers, setUberUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingUser, setAddingUser] = useState(null); // 'dat' or 'uber'
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');

  useEffect(() => {
    loadSubscription();
  }, []);

  async function loadSubscription() {
    try {
      setLoading(true);
      // In real app, this would be fetched for the current user/fleet
      const recs = await pb.collection('subscription_seats').getList(1, 1);
      if (recs.items.length > 0) {
        setSubscription(recs.items[0]);
        setDatUsers(recs.items[0].dat_users || []);
        setUberUsers(recs.items[0].uber_users || []);
      }
    } catch (err) {
      setError('Failed to load subscription details');
    } finally {
      setLoading(false);
    }
  }

  async function addUser(service) {
    if (!newUserName.trim() || !newUserEmail.trim()) {
      setError('Name and email required');
      return;
    }

    try {
      if (service === 'dat') {
        if (datUsers.length >= (subscription?.max_dat_logins || 2)) {
          setError(`DAT logins limit reached (${subscription?.max_dat_logins})`);
          return;
        }
        const updated = [...datUsers, { name: newUserName, email: newUserEmail, status: 'active' }];
        setDatUsers(updated);
        await pb.collection('subscription_seats').update(subscription.id, { dat_users: updated });
      } else if (service === 'uber') {
        if (uberUsers.length >= (subscription?.max_uber_logins || 2)) {
          setError(`Uber Freight logins limit reached (${subscription?.max_uber_logins})`);
          return;
        }
        const updated = [...uberUsers, { name: newUserName, email: newUserEmail, status: 'active' }];
        setUberUsers(updated);
        await pb.collection('subscription_seats').update(subscription.id, { uber_users: updated });
      }

      setNewUserName('');
      setNewUserEmail('');
      setAddingUser(null);
      setError('');
    } catch (err) {
      setError('Failed to add user');
    }
  }

  async function removeUser(service, index) {
    try {
      if (service === 'dat') {
        const updated = datUsers.filter((_, i) => i !== index);
        setDatUsers(updated);
        await pb.collection('subscription_seats').update(subscription.id, { dat_users: updated });
      } else {
        const updated = uberUsers.filter((_, i) => i !== index);
        setUberUsers(updated);
        await pb.collection('subscription_seats').update(subscription.id, { uber_users: updated });
      }
    } catch (err) {
      setError('Failed to remove user');
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: DARK, minHeight: '100vh', color: WHITE, padding: '20px' }}>
      <style>{`
        .seats-container { max-width: 1000px; margin: 0 auto; }
        .seats-header { margin-bottom: 40px; }
        .seats-title { font-size: 32px; font-weight: 900; margin-bottom: 8px; }
        .seats-sub { font-size: 16px; color: rgba(255,255,255,0.6); }

        .service-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(201,168,76,0.2); border-radius: 16px; padding: 32px; margin-bottom: 32px; }
        .service-title { font-size: 22px; font-weight: 900; margin-bottom: 4px; display: flex; align-items: center; gap: 12px; }
        .service-sub { font-size: 14px; color: rgba(255,255,255,0.5); margin-bottom: 20px; }

        .users-list { display: grid; gap: 12px; margin-bottom: 20px; }
        .user-row { display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; }
        .user-info { flex: 1; }
        .user-name { font-weight: 700; }
        .user-email { font-size: 13px; color: rgba(255,255,255,0.5); margin-top: 4px; }
        .user-badge { display: inline-block; background: rgba(34,197,94,0.2); border: 1px solid rgba(34,197,94,0.4); color: ${GREEN}; border-radius: 20px; padding: 4px 10px; font-size: 12px; font-weight: 700; }
        .remove-btn { background: rgba(239,68,68,0.1); border: none; color: ${RED}; border-radius: 8px; padding: 8px 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .remove-btn:hover { background: rgba(239,68,68,0.2); }

        .add-user-form { background: rgba(201,168,76,0.06); border: 1px solid rgba(201,168,76,0.2); border-radius: 12px; padding: 20px; display: ${addingUser ? 'grid' : 'none'}; gap: 12px; }
        .add-user-form.open { display: grid; }
        .form-input { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px 14px; color: white; font-family: inherit; outline: none; }
        .form-input:focus { border-color: ${GOLD}; background: rgba(201,168,76,0.05); }
        .form-buttons { display: flex; gap: 10px; }
        .btn { border: none; border-radius: 8px; padding: 10px 16px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: inherit; }
        .btn-add { background: ${GOLD}; color: ${DARK}; }
        .btn-add:hover { opacity: 0.9; }
        .btn-cancel { background: rgba(255,255,255,0.1); color: white; }
        .btn-cancel:hover { background: rgba(255,255,255,0.15); }

        .add-btn { background: ${GOLD}; color: ${DARK}; border: none; border-radius: 10px; padding: 12px 18px; font-weight: 900; cursor: pointer; font-family: inherit; transition: all 0.2s; width: 100%; }
        .add-btn:hover { opacity: 0.9; }

        .limit-bar { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 12px 16px; margin-bottom: 16px; font-size: 14px; }
        .limit-label { color: rgba(255,255,255,0.6); margin-bottom: 6px; }
        .limit-progress { background: rgba(255,255,255,0.05); border-radius: 20px; height: 6px; overflow: hidden; }
        .limit-fill { background: ${GOLD}; height: 100%; transition: width 0.3s; }

        .error-box { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #fca5a5; border-radius: 10px; padding: 12px 14px; margin-bottom: 20px; font-size: 14px; }

        @media(max-width: 600px) {
          .seats-container { padding: 0; }
          .service-card { border-radius: 0; padding: 20px; }
          .user-row { flex-direction: column; align-items: flex-start; }
          .form-buttons { flex-direction: column; }
        }
      `}</style>

      <div className="seats-container">
        <div className="seats-header">
          <h1 className="seats-title">🔐 Subscription & Load Board Access</h1>
          <p className="seats-sub">Manage logins for DAT and Uber Freight — each subscription includes up to 2 users per service.</p>
        </div>

        {error && <div className="error-box">{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', padding: '40px 20px' }}>Loading your subscription…</div>
        ) : (
          <>
            {/* DAT Load Board */}
            <div className="service-card">
              <div className="service-title">
                <span>📦</span> DAT Load Board
              </div>
              <p className="service-sub">North America's largest load board — $99–$299/month included with your subscription</p>

              <div className="limit-bar">
                <div className="limit-label">Logins Used: {datUsers.length} of {subscription?.max_dat_logins || 2}</div>
                <div className="limit-progress">
                  <div className="limit-fill" style={{ width: `${(datUsers.length / (subscription?.max_dat_logins || 2)) * 100}%` }} />
                </div>
              </div>

              {datUsers.length > 0 && (
                <div className="users-list">
                  {datUsers.map((user, i) => (
                    <div key={i} className="user-row">
                      <div className="user-info">
                        <div className="user-name">{user.name}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div className="user-badge">{user.status || 'active'}</div>
                        <button className="remove-btn" onClick={() => removeUser('dat', i)}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {datUsers.length < (subscription?.max_dat_logins || 2) && (
                <>
                  {addingUser === 'dat' ? (
                    <div className="add-user-form open">
                      <input
                        className="form-input"
                        type="text"
                        placeholder="Driver name"
                        value={newUserName}
                        onChange={e => setNewUserName(e.target.value)}
                      />
                      <input
                        className="form-input"
                        type="email"
                        placeholder="Email address"
                        value={newUserEmail}
                        onChange={e => setNewUserEmail(e.target.value)}
                      />
                      <div className="form-buttons">
                        <button className="btn btn-add" onClick={() => addUser('dat')}>Add User</button>
                        <button className="btn btn-cancel" onClick={() => setAddingUser(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button className="add-btn" onClick={() => setAddingUser('dat')}>+ Add Driver Login</button>
                  )}
                </>
              )}
            </div>

            {/* Uber Freight */}
            <div className="service-card">
              <div className="service-title">
                <span>🔵</span> Uber Freight
              </div>
              <p className="service-sub">Instant-book loads, van/flatbed/reefer — guaranteed rates, included with subscription</p>

              <div className="limit-bar">
                <div className="limit-label">Logins Used: {uberUsers.length} of {subscription?.max_uber_logins || 2}</div>
                <div className="limit-progress">
                  <div className="limit-fill" style={{ width: `${(uberUsers.length / (subscription?.max_uber_logins || 2)) * 100}%` }} />
                </div>
              </div>

              {uberUsers.length > 0 && (
                <div className="users-list">
                  {uberUsers.map((user, i) => (
                    <div key={i} className="user-row">
                      <div className="user-info">
                        <div className="user-name">{user.name}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div className="user-badge">{user.status || 'active'}</div>
                        <button className="remove-btn" onClick={() => removeUser('uber', i)}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {uberUsers.length < (subscription?.max_uber_logins || 2) && (
                <>
                  {addingUser === 'uber' ? (
                    <div className="add-user-form open">
                      <input
                        className="form-input"
                        type="text"
                        placeholder="Driver name"
                        value={newUserName}
                        onChange={e => setNewUserName(e.target.value)}
                      />
                      <input
                        className="form-input"
                        type="email"
                        placeholder="Email address"
                        value={newUserEmail}
                        onChange={e => setNewUserEmail(e.target.value)}
                      />
                      <div className="form-buttons">
                        <button className="btn btn-add" onClick={() => addUser('uber')}>Add User</button>
                        <button className="btn btn-cancel" onClick={() => setAddingUser(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button className="add-btn" onClick={() => setAddingUser('uber')}>+ Add Driver Login</button>
                  )}
                </>
              )}
            </div>

            <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 14, padding: 24, marginTop: 32 }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: GOLD }}>💡 Need more logins?</div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 12 }}>Each subscription includes 2 logins per load board service. Additional seats are $15/seat/month. Call 636-706-8338 to upgrade.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
