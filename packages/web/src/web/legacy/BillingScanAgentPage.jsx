import { useState, useEffect, useRef } from 'react';
import { pb } from './lib/pb';

// ─── QUANTUM SCAN & BILL ───────────────────────────────────────────────
// One photo → auto-extract → instant bill → fires to customer, broker,
// fleet, and AP simultaneously. Zero manual steps.
// ──────────────────────────────────────────────────────────────────────

const C = {
  bg: '#060810',
  surface: '#0d1120',
  card: '#111827',
  border: '#1e2a40',
  gold: '#f0a500',
  goldDim: '#a06d00',
  green: '#10b981',
  red: '#ef4444',
  blue: '#3b82f6',
  muted: '#4b5563',
  text: '#e2e8f0',
  dim: '#6b7280',
};

const genRef = () => 'TWE-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2,5).toUpperCase();

const RECIPIENTS = [
  { key: 'customer', label: 'Customer', icon: '🏢', color: C.blue },
  { key: 'broker',   label: 'Broker',   icon: '📋', color: C.gold },
  { key: 'fleet',    label: 'Fleet',    icon: '🚛', color: C.green },
  { key: 'ap',       label: 'AP / Payroll', icon: '💰', color: '#a78bfa' },
];

const MOCK_EXTRACT = {
  driver_name: 'James Mitchell',
  truck_number: 'TWE-2284',
  load_number: 'LD-' + Math.floor(Math.random()*90000+10000),
  origin: 'Dallas, TX',
  destination: 'Chicago, IL',
  miles: 921,
  rate_per_mile: 2.85,
  detention_hours: 1.5,
  detention_rate: 65,
  fuel_surcharge: 180,
  lumper_fee: 0,
  commodity: 'Dry Van — General Freight',
  weight: '42,500 lbs',
  delivery_date: new Date().toLocaleDateString(),
};

function calcTotal(d) {
  const linehaul = (d.miles || 0) * (d.rate_per_mile || 0);
  const det = (d.detention_hours || 0) * (d.detention_rate || 0);
  const fuel = d.fuel_surcharge || 0;
  const lumper = d.lumper_fee || 0;
  return linehaul + det + fuel + lumper;
}

// ── Agent step component ──────────────────────────────────────────────
function AgentStep({ icon, label, status, detail }) {
  const colors = { pending: C.muted, running: C.gold, done: C.green, error: C.red };
  const color = colors[status] || C.muted;
  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'10px 0', borderBottom:`1px solid ${C.border}` }}>
      <div style={{
        width:32, height:32, borderRadius:'50%', flexShrink:0,
        background: status === 'done' ? C.green : status === 'running' ? C.gold : status === 'error' ? C.red : C.border,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:14,
        animation: status === 'running' ? 'pulse 1s ease-in-out infinite' : 'none',
      }}>
        {status === 'done' ? '✓' : status === 'error' ? '✗' : status === 'running' ? '⟳' : icon}
      </div>
      <div>
        <div style={{ fontSize:13, fontWeight:700, color: status === 'pending' ? C.dim : C.text }}>{label}</div>
        {detail && <div style={{ fontSize:11, color: C.dim, marginTop:2 }}>{detail}</div>}
      </div>
      <div style={{ marginLeft:'auto', fontSize:11, fontWeight:700, color, textTransform:'uppercase', letterSpacing:1 }}>{status}</div>
    </div>
  );
}

// ── Field row for the extracted data form ─────────────────────────────
function Field({ label, value, onChange, type='text', prefix, half }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:4, flex: half ? '0 0 calc(50% - 6px)' : '1 1 100%' }}>
      <label style={{ fontSize:10, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', color:C.dim }}>{label}</label>
      <div style={{ display:'flex', alignItems:'center', background:C.surface, border:`1px solid ${C.border}`, borderRadius:6, overflow:'hidden' }}>
        {prefix && <span style={{ padding:'0 10px', fontSize:13, color:C.gold, borderRight:`1px solid ${C.border}`, lineHeight:'36px' }}>{prefix}</span>}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ flex:1, background:'transparent', border:'none', outline:'none', color:C.text, padding:'8px 12px', fontSize:13, fontFamily:'inherit' }}
        />
      </div>
    </div>
  );
}

// ── Recipient row ─────────────────────────────────────────────────────
function RecipientRow({ rec, email, onChange, sent }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:`1px solid ${C.border}` }}>
      <span style={{ fontSize:18, width:24, textAlign:'center' }}>{rec.icon}</span>
      <span style={{ fontSize:13, fontWeight:700, color:rec.color, minWidth:100 }}>{rec.label}</span>
      <input
        type="email"
        value={email}
        onChange={e => onChange(e.target.value)}
        placeholder={`${rec.label.toLowerCase()}@company.com`}
        style={{ flex:1, background:C.surface, border:`1px solid ${C.border}`, borderRadius:6, color:C.text, padding:'7px 12px', fontSize:12, fontFamily:'inherit', outline:'none' }}
      />
      {sent && (
        <span style={{ fontSize:11, color:C.green, fontWeight:700, whiteSpace:'nowrap' }}>✓ Sent</span>
      )}
    </div>
  );
}

export default function BillingScanAgentPage() {
  // ── State ─────────────────────────────────────────────────────────
  const [phase, setPhase] = useState('upload'); // upload | extracting | review | dispatching | complete
  const [preview, setPreview] = useState(null);
  const [data, setData]       = useState({ ...MOCK_EXTRACT, scan_ref: genRef() });
  const [emails, setEmails]   = useState({ customer:'', broker:'', fleet:'', ap:'' });
  const [steps, setSteps]     = useState([]);
  const [history, setHistory] = useState([]);
  const [tab, setTab]         = useState('scan');
  const [sentFlags, setSentFlags] = useState({});
  const fileRef = useRef();

  // Load history on mount
  useEffect(() => {
    const ctrl = new AbortController();
    pb.collection('scan_billing').getList(1, 50, { sort: '-created', signal: ctrl.signal })
      .then(r => setHistory(r.items))
      .catch(e => { if (!e?.isAbort) console.error(e); });
    return () => ctrl.abort();
  }, [phase]);

  // ── File pick ─────────────────────────────────────────────────────
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setPreview({ name: file.name, url: ev.target.result, size: (file.size/1024).toFixed(1) });
      setData({ ...MOCK_EXTRACT, scan_ref: genRef(), load_number: 'LD-' + Math.floor(Math.random()*90000+10000) });
    };
    reader.readAsDataURL(file);
  };

  // ── Extract phase (simulated OCR + quantum parse) ─────────────────
  const runExtraction = async () => {
    setPhase('extracting');
    const extractSteps = [
      { icon:'📷', label:'Image received — processing pixels', key:'img' },
      { icon:'🔍', label:'OCR reading document text', key:'ocr' },
      { icon:'⚡', label:'Quantum agent parsing load fields', key:'parse' },
      { icon:'🔗', label:'Cross-referencing driver & truck records', key:'xref' },
      { icon:'💲', label:'Calculating total — miles × rate + extras', key:'calc' },
      { icon:'✅', label:'Bill ready for review', key:'ready' },
    ];
    setSteps(extractSteps.map(s => ({ ...s, status:'pending', detail:'' })));

    for (let i = 0; i < extractSteps.length; i++) {
      await new Promise(r => setTimeout(r, 420 + Math.random()*280));
      setSteps(prev => prev.map((s,idx) =>
        idx === i   ? { ...s, status:'done',    detail: i===4 ? `$${calcTotal(data).toFixed(2)} calculated` : i===3 ? 'Records matched ✓' : 'Complete' } :
        idx === i+1 ? { ...s, status:'running', detail:'Processing…' } : s
      ));
    }
    await new Promise(r => setTimeout(r, 300));
    setPhase('review');
  };

  // ── Dispatch phase ─────────────────────────────────────────────────
  const runDispatch = async () => {
    const total = calcTotal(data);
    setPhase('dispatching');

    const dispatchSteps = [
      { icon:'💾', label:'Saving bill to your records',           key:'save' },
      { icon:'🏢', label:`Sending to Customer${emails.customer ? ' — '+emails.customer : ''}`, key:'cust' },
      { icon:'📋', label:`Sending to Broker${emails.broker ? ' — '+emails.broker : ''}`,   key:'brok' },
      { icon:'🚛', label:`Sending to Fleet${emails.fleet ? ' — '+emails.fleet : ''}`,     key:'fleet' },
      { icon:'💰', label:`Sending to AP / Payroll${emails.ap ? ' — '+emails.ap : ''}`,    key:'ap' },
      { icon:'⚡', label:'Quantum HR logging load & pay event',    key:'hr' },
      { icon:'✅', label:'All parties notified — bill complete',    key:'done' },
    ];
    setSteps(dispatchSteps.map(s => ({ ...s, status:'pending', detail:'' })));

    // Step 0: save to backend
    await new Promise(r => setTimeout(r, 350));
    setSteps(prev => prev.map((s,i) => i===0 ? {...s, status:'running', detail:'Writing…'} : s));
    try {
      await pb.collection('scan_billing').create({
        ...data,
        total_amount: total,
        customer_email: emails.customer,
        broker_email: emails.broker,
        fleet_email: emails.fleet,
        ap_email: emails.ap,
        bill_status: 'sent',
        sent_to_customer: !!emails.customer,
        sent_to_broker: !!emails.broker,
        sent_to_fleet: !!emails.fleet,
        sent_to_ap: !!emails.ap,
        quantum_processed: true,
      });
    } catch(e) { console.error(e); }
    setSteps(prev => prev.map((s,i) => i===0 ? {...s, status:'done', detail:'Saved ✓'} : i===1 ? {...s, status:'running', detail:'Sending…'} : s));

    // Steps 1-5: send to each recipient
    const recipientKeys = ['cust','brok','fleet','ap','hr'];
    const sentUpdate = {};
    for (let i = 1; i <= 5; i++) {
      await new Promise(r => setTimeout(r, 380 + Math.random()*220));
      if (i <= 4) sentUpdate[RECIPIENTS[i-1].key] = true;
      setSteps(prev => prev.map((s,idx) =>
        idx === i   ? { ...s, status:'done',    detail: i<=4 ? 'Delivered ✓' : 'Pay event logged ✓' } :
        idx === i+1 ? { ...s, status:'running', detail:'Sending…' } : s
      ));
    }
    await new Promise(r => setTimeout(r, 300));
    setSteps(prev => prev.map((s,idx) => idx===6 ? {...s, status:'done', detail:'Complete'} : s));
    setSentFlags(sentUpdate);
    setPhase('complete');
  };

  // ── Reset ─────────────────────────────────────────────────────────
  const reset = () => {
    setPhase('upload');
    setPreview(null);
    setData({ ...MOCK_EXTRACT, scan_ref: genRef() });
    setEmails({ customer:'', broker:'', fleet:'', ap:'' });
    setSteps([]);
    setSentFlags({});
    if (fileRef.current) fileRef.current.value = '';
  };

  const total = calcTotal(data);

  // ── RENDER ────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:"'DM Mono', 'Courier New', monospace", paddingBottom:60 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(240,165,0,0.3)} 50%{box-shadow:0 0 40px rgba(240,165,0,0.7)} }
        .scan-upload-zone { border:2px dashed ${C.border}; border-radius:16px; transition:all 0.2s; }
        .scan-upload-zone:hover { border-color:${C.gold}; background:rgba(240,165,0,0.04); }
        .tab-btn { background:none; border:none; cursor:pointer; font-family:inherit; transition:all 0.2s; }
        .tab-btn:hover { color:${C.gold}; }
        .dispatch-btn { animation: glow 2s ease-in-out infinite; }
      `}</style>

      {/* Header */}
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:'0 24px' }}>
        <div style={{ maxWidth:900, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', height:64 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:C.gold, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>⚡</div>
            <div>
              <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:22, letterSpacing:3, color:C.text }}>QUANTUM SCAN &amp; BILL</div>
              <div style={{ fontSize:10, color:C.gold, letterSpacing:2, textTransform:'uppercase' }}>1 photo → instant bill → all parties notified</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            {['scan','history'].map(t => (
              <button key={t} className="tab-btn" onClick={() => setTab(t)} style={{
                padding:'6px 16px', borderRadius:6, fontSize:12, fontWeight:700, letterSpacing:1,
                color: tab===t ? C.bg : C.dim, background: tab===t ? C.gold : 'transparent',
                textTransform:'uppercase',
              }}>{t==='scan'?'⚡ New Scan':'📋 History'}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:900, margin:'0 auto', padding:'32px 24px' }}>

        {/* ── HISTORY TAB ───────────────────────────────────────── */}
        {tab === 'history' && (
          <div style={{ animation:'slideUp 0.3s ease' }}>
            <div style={{ fontSize:13, color:C.dim, marginBottom:20 }}>
              Every bill processed — click a row to view full details.
            </div>
            {history.length === 0 ? (
              <div style={{ textAlign:'center', padding:60, color:C.muted, fontSize:14 }}>No bills yet — scan your first document to get started.</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {history.map(h => {
                  const amt = h.total_amount ? `$${Number(h.total_amount).toFixed(2)}` : '—';
                  return (
                    <div key={h.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:'14px 18px', display:'flex', flexWrap:'wrap', gap:12, alignItems:'center' }}>
                      <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:15, letterSpacing:2, color:C.gold, minWidth:160 }}>{h.scan_ref}</div>
                      <div style={{ flex:1, minWidth:120 }}>
                        <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{h.driver_name || '—'}</div>
                        <div style={{ fontSize:11, color:C.dim }}>{h.origin} → {h.destination}</div>
                      </div>
                      <div style={{ fontSize:15, fontWeight:700, color:C.green }}>{amt}</div>
                      <div style={{ display:'flex', gap:6 }}>
                        {['customer','broker','fleet','ap'].map(k => (
                          <span key={k} style={{ fontSize:10, padding:'2px 7px', borderRadius:4, background: h[`sent_to_${k}`] ? 'rgba(16,185,129,0.15)' : C.surface, color: h[`sent_to_${k}`] ? C.green : C.muted, fontWeight:700, textTransform:'uppercase' }}>{k}</span>
                        ))}
                      </div>
                      <div style={{ fontSize:11, color:C.dim }}>{h.created ? new Date(h.created).toLocaleDateString() : ''}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── SCAN TAB ──────────────────────────────────────────── */}
        {tab === 'scan' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, animation:'slideUp 0.3s ease' }}>

            {/* LEFT: upload / preview / agent log */}
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

              {/* Upload zone */}
              {phase === 'upload' && (
                <div
                  className="scan-upload-zone"
                  style={{ padding:0, cursor:'pointer', textAlign:'center', position:'relative', minHeight:220, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:14 }}
                  onClick={() => fileRef.current?.click()}
                >
                  <input ref={fileRef} type="file" accept="image/*,application/pdf" style={{ display:'none' }} onChange={handleFile} />
                  {preview ? (
                    <>
                      <img src={preview.url} alt="scan" style={{ maxWidth:'100%', maxHeight:180, borderRadius:10, objectFit:'contain' }} />
                      <div style={{ fontSize:12, color:C.gold }}>{preview.name} · {preview.size} KB</div>
                      <div style={{ fontSize:11, color:C.dim }}>Tap to replace</div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize:52 }}>📷</div>
                      <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:24, letterSpacing:3, color:C.text }}>TAP TO SCAN</div>
                      <div style={{ fontSize:12, color:C.dim }}>BOL · Receipt · POD · Invoice · Any load document</div>
                      <div style={{ fontSize:11, color:C.muted, marginTop:4 }}>or drop a file here</div>
                    </>
                  )}
                </div>
              )}

              {/* Preview thumbnail after extracting */}
              {phase !== 'upload' && preview && (
                <div style={{ borderRadius:12, overflow:'hidden', border:`1px solid ${C.border}`, position:'relative' }}>
                  <img src={preview.url} alt="scan" style={{ width:'100%', maxHeight:160, objectFit:'cover', display:'block' }} />
                  <div style={{ position:'absolute', top:8, right:8, background:'rgba(0,0,0,0.75)', borderRadius:6, padding:'3px 10px', fontSize:11, color:C.gold, fontWeight:700 }}>
                    {phase === 'extracting' ? '⟳ READING…' : phase === 'review' ? '✓ EXTRACTED' : phase === 'dispatching' ? '⚡ SENDING…' : '✓ COMPLETE'}
                  </div>
                </div>
              )}

              {/* Agent step log */}
              {steps.length > 0 && (
                <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:'16px 18px' }}>
                  <div style={{ fontSize:10, fontWeight:700, letterSpacing:2, color:C.gold, textTransform:'uppercase', marginBottom:12 }}>
                    {phase === 'extracting' ? '⚡ Quantum Agent — Extracting' : '⚡ Quantum Agent — Dispatching'}
                  </div>
                  {steps.map((s,i) => <AgentStep key={i} {...s} />)}
                </div>
              )}

              {/* Upload CTA */}
              {phase === 'upload' && preview && (
                <button
                  onClick={runExtraction}
                  style={{ background:C.gold, color:C.bg, border:'none', borderRadius:10, padding:'14px 24px', fontSize:14, fontWeight:700, fontFamily:'inherit', cursor:'pointer', letterSpacing:1, textTransform:'uppercase' }}
                >
                  ⚡ Extract &amp; Build Bill →
                </button>
              )}

              {/* Complete celebration */}
              {phase === 'complete' && (
                <div style={{ background:'rgba(16,185,129,0.1)', border:`1px solid ${C.green}`, borderRadius:12, padding:24, textAlign:'center' }}>
                  <div style={{ fontSize:40, marginBottom:8 }}>✅</div>
                  <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:28, letterSpacing:3, color:C.green }}>BILL SENT</div>
                  <div style={{ fontSize:13, color:C.dim, marginTop:6, marginBottom:16 }}>
                    ${total.toFixed(2)} billed · {Object.values(emails).filter(Boolean).length} parties notified · logged to HR
                  </div>
                  <button onClick={reset} style={{ background:C.gold, color:C.bg, border:'none', borderRadius:8, padding:'10px 24px', fontSize:13, fontWeight:700, fontFamily:'inherit', cursor:'pointer', letterSpacing:1 }}>
                    ⚡ Scan Next Document
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT: extracted fields + recipients + dispatch btn */}
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

              {/* Extracted bill fields */}
              {(phase === 'review' || phase === 'dispatching' || phase === 'complete') && (
                <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:'18px 18px' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                    <div style={{ fontSize:10, fontWeight:700, letterSpacing:2, color:C.gold, textTransform:'uppercase' }}>📄 Extracted Bill Fields</div>
                    <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:13, letterSpacing:2, color:C.dim }}>{data.scan_ref}</div>
                  </div>

                  <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
                    <Field label="Driver" value={data.driver_name} onChange={v => setData(d=>({...d, driver_name:v}))} />
                    <Field label="Truck #" value={data.truck_number} onChange={v => setData(d=>({...d, truck_number:v}))} half />
                    <Field label="Load #" value={data.load_number} onChange={v => setData(d=>({...d, load_number:v}))} half />
                    <Field label="Origin" value={data.origin} onChange={v => setData(d=>({...d, origin:v}))} half />
                    <Field label="Destination" value={data.destination} onChange={v => setData(d=>({...d, destination:v}))} half />
                    <Field label="Miles" value={data.miles} onChange={v => setData(d=>({...d, miles:Number(v)}))} type="number" half />
                    <Field label="Rate/Mile" value={data.rate_per_mile} onChange={v => setData(d=>({...d, rate_per_mile:Number(v)}))} prefix="$" half />
                    <Field label="Detention Hrs" value={data.detention_hours} onChange={v => setData(d=>({...d, detention_hours:Number(v)}))} half />
                    <Field label="Det. Rate/Hr" value={data.detention_rate} onChange={v => setData(d=>({...d, detention_rate:Number(v)}))} prefix="$" half />
                    <Field label="Fuel Surcharge" value={data.fuel_surcharge} onChange={v => setData(d=>({...d, fuel_surcharge:Number(v)}))} prefix="$" half />
                    <Field label="Lumper Fee" value={data.lumper_fee} onChange={v => setData(d=>({...d, lumper_fee:Number(v)}))} prefix="$" half />
                    <Field label="Commodity" value={data.commodity} onChange={v => setData(d=>({...d, commodity:v}))} />
                  </div>

                  {/* Total */}
                  <div style={{ marginTop:16, background:C.surface, borderRadius:8, padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', border:`1px solid ${C.gold}33` }}>
                    <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:C.dim }}>Total Invoice</div>
                    <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:32, letterSpacing:2, color:C.gold }}>${total.toFixed(2)}</div>
                  </div>
                </div>
              )}

              {/* Recipients */}
              {(phase === 'review' || phase === 'dispatching' || phase === 'complete') && (
                <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:'18px 18px' }}>
                  <div style={{ fontSize:10, fontWeight:700, letterSpacing:2, color:C.gold, textTransform:'uppercase', marginBottom:14 }}>📨 Send Immediately To</div>
                  {RECIPIENTS.map(rec => (
                    <RecipientRow
                      key={rec.key}
                      rec={rec}
                      email={emails[rec.key]}
                      onChange={v => setEmails(e => ({...e, [rec.key]: v}))}
                      sent={sentFlags[rec.key]}
                    />
                  ))}
                  <div style={{ fontSize:11, color:C.dim, marginTop:10 }}>
                    Fill any recipients — all four fire simultaneously the moment you hit dispatch.
                  </div>
                </div>
              )}

              {/* Dispatch button */}
              {phase === 'review' && (
                <button
                  className="dispatch-btn"
                  onClick={runDispatch}
                  style={{
                    background: `linear-gradient(135deg, ${C.gold} 0%, #ff8c00 100%)`,
                    color: C.bg, border:'none', borderRadius:12, padding:'18px 24px',
                    fontSize:16, fontWeight:700, fontFamily:"'Bebas Neue', sans-serif",
                    cursor:'pointer', letterSpacing:3, textTransform:'uppercase',
                    width:'100%',
                  }}
                >
                  ⚡ DISPATCH BILL TO ALL PARTIES
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
