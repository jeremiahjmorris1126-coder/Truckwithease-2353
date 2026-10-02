import React, { useState, useEffect } from 'react';
import { ShoppingCart, Zap, Users, FileText, CheckCircle, AlertCircle, Star, Package, Phone, Mail, Clock, TrendingUp } from "lucide-react";
import PocketBase from 'pocketbase';

const pb = new PocketBase();

const colors = {
  navy: '#1e3a5f',
  orange: '#f97316',
  amber: '#f59e0b',
  green: '#10b981',
  red: '#ef4444',
  lightBg: '#f8fafc',
  darkBg: '#0f172a',
  cardBg: '#0f2640'
};

const SUPPLIERS = [
  {
    id: 1,
    name: 'TechTrax ELD Solutions',
    rating: 4.8,
    reviews: 347,
    badge: 'TOP RATED',
    badgeColor: colors.amber,
    speciality: 'ELD & Fleet Compliance',
    products: [
      { name: 'Standard ELD License', price: 9.99, unit: '/seat/mo', specs: 'GPS, HOS logging, cloud sync — drivers download app' },
      { name: 'Premium ELD + Dash Cam', price: 14.99, unit: '/seat/mo', specs: 'GPS, HOS, dash cam, cloud sync — full FMCSA compliance' },
      { name: 'Fleet Manager Suite', price: 12.99, unit: '/seat/mo', specs: 'Dispatch, DVIR, reporting, driver monitoring' }
    ],
    leadTime: '3–5 business days',
    support: '24/7 phone & email',
    bulk: 'Discounts available for 10+ seats',
    phone: '1-888-555-0101',
    email: 'fleet@techtraxeld.com'
  },
  {
    id: 2,
    name: 'MobileTruck Pro',
    rating: 4.6,
    reviews: 291,
    badge: 'FAST SETUP',
    badgeColor: colors.green,
    speciality: 'Voice-Enabled ELD',
    products: [
      { name: 'SmartELD Pro', price: 8.99, unit: '/seat/mo', specs: 'ELD, GPS, voice control — fastest setup on market' },
      { name: 'Rugged ELD + Dash', price: 13.99, unit: '/seat/mo', specs: 'IP67 rated, 4G LTE, full DVIR' },
      { name: 'Complete Fleet Suite', price: 16.99, unit: '/seat/mo', specs: 'ELD + dash cam + dispatch + advanced reports' }
    ],
    leadTime: '2–4 business days',
    support: '24/7 chat & phone',
    bulk: 'Volume pricing at 5+ seats',
    phone: '1-888-555-0202',
    email: 'sales@mobiletruckpro.com'
  },
  {
    id: 3,
    name: 'FleetGear Direct',
    rating: 4.7,
    reviews: 413,
    badge: 'BEST VALUE',
    badgeColor: colors.orange,
    speciality: 'Full Fleet Solutions',
    products: [
      { name: 'Essential ELD', price: 7.99, unit: '/seat/mo', specs: 'FMCSA compliant, GPS tracking, cloud HOS' },
      { name: 'Command Center', price: 11.99, unit: '/seat/mo', specs: 'Dispatch, DVIR, live maps, reports' },
      { name: 'Complete Truck Suite', price: 17.99, unit: '/seat/mo', specs: 'ELD + Dispatch + Dash Cam + Analytics' }
    ],
    leadTime: '1–3 business days',
    support: '24/7 + onsite training',
    bulk: 'Best rates for 20+ seats',
    phone: '1-888-555-0303',
    email: 'orders@fleetgeardirect.com'
  }
];

function generateOrderNumber() {
  return 'TWE-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
}

export default function HardwareSupplierIntegration() {
  const [activeTab, setActiveTab] = useState('suppliers');
  const [cartItems, setCartItems] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  // Order form state
  const [orderForm, setOrderForm] = useState({
    fleet_name: '',
    contact_name: '',
    email: '',
    phone: '',
    fleet_size: '',
    ship_to_address: ''
  });

  // Inquiry form state
  const [inquiryForm, setInquiryForm] = useState({
    fleet_name: '',
    contact_name: '',
    email: '',
    phone: '',
    fleet_size: '',
    message: ''
  });

  useEffect(() => {
    if (activeTab === 'orders') {
      loadOrders();
    }
  }, [activeTab]);

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const result = await pb.collection('supplier_orders').getList(1, 50, {
        sort: '-created'
      });
      setOrders(result.items);
    } catch (e) {
      // no orders yet
    }
    setLoadingOrders(false);
  };

  const addToCart = (supplier, product) => {
    setCartItems(prev => [...prev, {
      id: Date.now(),
      supplierId: supplier.id,
      supplier: supplier.name,
      product: product.name,
      price: product.price,
      unit: product.unit,
      qty: quantity,
      total: product.price * quantity
    }]);
    setQuantity(1);
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.total, 0);

  const handleOrderSubmit = async () => {
    if (!orderForm.fleet_name || !orderForm.contact_name || !orderForm.email) {
      alert('Please fill in Fleet Name, Contact Name, and Email to place your order.');
      return;
    }
    if (cartItems.length === 0) {
      alert('Your cart is empty. Add items before checking out.');
      return;
    }

    setSubmitting(true);
    try {
      for (const item of cartItems) {
        await pb.collection('supplier_orders').create({
          order_number: generateOrderNumber(),
          fleet_name: orderForm.fleet_name,
          contact_name: orderForm.contact_name,
          email: orderForm.email,
          phone: orderForm.phone,
          fleet_size: orderForm.fleet_size ? parseInt(orderForm.fleet_size) : 0,
          supplier_name: item.supplier,
          product_name: item.product,
          quantity: item.qty,
          unit_price: item.price,
          total_price: item.total,
          order_status: 'Pending',
          ship_to_address: orderForm.ship_to_address,
          notes: `Placed via TruckWithEase supplier marketplace`
        });
      }
      setSubmitted(true);
      setCartItems([]);
      setOrderForm({ fleet_name: '', contact_name: '', email: '', phone: '', fleet_size: '', ship_to_address: '' });
    } catch (e) {
      alert('There was an issue placing your order. Please try again.');
    }
    setSubmitting(false);
  };

  const handleInquirySubmit = async (supplierName) => {
    if (!inquiryForm.contact_name || !inquiryForm.email) {
      alert('Please enter your name and email to send an inquiry.');
      return;
    }
    setSubmitting(true);
    try {
      await pb.collection('supplier_inquiries').create({
        fleet_name: inquiryForm.fleet_name,
        contact_name: inquiryForm.contact_name,
        email: inquiryForm.email,
        phone: inquiryForm.phone,
        fleet_size: inquiryForm.fleet_size ? parseInt(inquiryForm.fleet_size) : 0,
        supplier_name: supplierName,
        message: inquiryForm.message || `Interested in products from ${supplierName}`,
        status: 'New'
      });
      setInquirySubmitted(true);
      setInquiryForm({ fleet_name: '', contact_name: '', email: '', phone: '', fleet_size: '', message: '' });
      setTimeout(() => setInquirySubmitted(false), 5000);
    } catch (e) {
      alert('Could not send inquiry. Please try again.');
    }
    setSubmitting(false);
  };

  const statusColor = (status) => {
    if (!status) return colors.amber;
    if (status.toLowerCase().includes('delivered')) return colors.green;
    if (status.toLowerCase().includes('shipped')) return '#3b82f6';
    if (status.toLowerCase().includes('cancelled')) return colors.red;
    return colors.amber;
  };

  return (
    <div style={{ background: colors.darkBg, minHeight: '100vh', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: colors.cardBg, border: `1px solid ${colors.orange}`, borderRadius: '2rem', padding: '0.5rem 1.25rem', marginBottom: '1rem' }}>
            <Package style={{ width: '18px', height: '18px', color: colors.orange }} />
            <span style={{ color: colors.orange, fontWeight: '700', fontSize: '0.85rem', letterSpacing: '0.1em' }}>SOFTWARE LICENSE MARKETPLACE</span>
          </div>
          <h1 style={{ color: '#fff', fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: '800', margin: '0 0 0.75rem 0', lineHeight: 1.15 }}>
            ELD Supplier Network
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', margin: 0, maxWidth: '600px', marginInline: 'auto' }}>
            Browse certified ELD software licenses from verified suppliers. Drivers download the app — no hardware to ship.
          </p>
        </div>

        {/* Stats Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Certified Suppliers', value: '3', icon: <Users style={{ width: '20px', height: '20px', color: colors.orange }} /> },
            { label: 'Avg Setup Time', value: '< 1 hr', icon: <Clock style={{ width: '20px', height: '20px', color: colors.green }} /> },
            { label: 'Starting At', value: '$7.99/mo', icon: <TrendingUp style={{ width: '20px', height: '20px', color: colors.amber }} /> },
            { label: 'FMCSA Compliant', value: '100%', icon: <CheckCircle style={{ width: '20px', height: '20px', color: colors.green }} /> }
          ].map((stat, i) => (
            <div key={i} style={{ background: colors.cardBg, border: `1px solid ${colors.navy}`, borderRadius: '0.75rem', padding: '1rem', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>{stat.icon}</div>
              <div style={{ color: '#fff', fontWeight: '700', fontSize: '1.25rem' }}>{stat.value}</div>
              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', background: colors.cardBg, borderRadius: '0.75rem', padding: '0.5rem', width: 'fit-content' }}>
          {[
            { id: 'suppliers', label: 'Suppliers', icon: <Zap style={{ width: '16px', height: '16px' }} /> },
            { id: 'cart', label: `Cart${cartItems.length > 0 ? ` (${cartItems.length})` : ''}`, icon: <ShoppingCart style={{ width: '16px', height: '16px' }} /> },
            { id: 'orders', label: 'My Orders', icon: <FileText style={{ width: '16px', height: '16px' }} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.6rem 1.25rem',
                background: activeTab === tab.id ? colors.orange : 'transparent',
                color: activeTab === tab.id ? '#fff' : '#94a3b8',
                border: 'none', borderRadius: '0.5rem',
                cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* ── SUPPLIERS TAB ── */}
        {activeTab === 'suppliers' && (
          <div>
            {inquirySubmitted && (
              <div style={{ background: '#052e16', border: `1px solid ${colors.green}`, borderRadius: '0.75rem', padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CheckCircle style={{ width: '20px', height: '20px', color: colors.green, flexShrink: 0 }} />
                <span style={{ color: colors.green, fontWeight: '600' }}>Your inquiry was sent! The supplier will contact you within 1 business day.</span>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
              {SUPPLIERS.map(supplier => (
                <div
                  key={supplier.id}
                  style={{
                    background: colors.cardBg,
                    border: `2px solid ${selectedSupplier?.id === supplier.id ? colors.orange : colors.navy}`,
                    borderRadius: '1rem',
                    overflow: 'hidden',
                    transition: 'border-color 0.2s, transform 0.2s',
                    transform: selectedSupplier?.id === supplier.id ? 'translateY(-2px)' : 'none'
                  }}
                >
                  {/* Supplier header */}
                  <div
                    style={{ padding: '1.25rem 1.5rem', cursor: 'pointer', background: selectedSupplier?.id === supplier.id ? '#0d1f35' : 'transparent' }}
                    onClick={() => setSelectedSupplier(selectedSupplier?.id === supplier.id ? null : supplier)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span style={{ background: supplier.badgeColor, color: '#fff', fontSize: '0.65rem', fontWeight: '800', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', letterSpacing: '0.05em' }}>
                            {supplier.badge}
                          </span>
                        </div>
                        <h3 style={{ color: '#fff', margin: 0, fontSize: '1.15rem', fontWeight: '700' }}>{supplier.name}</h3>
                        <p style={{ color: '#64748b', margin: '0.2rem 0 0 0', fontSize: '0.85rem' }}>{supplier.speciality}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end' }}>
                          <Star style={{ width: '14px', height: '14px', color: colors.amber }} />
                          <span style={{ color: colors.amber, fontWeight: '700' }}>{supplier.rating}</span>
                        </div>
                        <div style={{ color: '#475569', fontSize: '0.78rem' }}>{supplier.reviews} reviews</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.8rem' }}>
                      <span style={{ background: '#1e293b', color: '#94a3b8', padding: '0.3rem 0.6rem', borderRadius: '0.375rem' }}>⚡ {supplier.leadTime}</span>
                      <span style={{ background: '#1e293b', color: '#94a3b8', padding: '0.3rem 0.6rem', borderRadius: '0.375rem' }}>💬 {supplier.support}</span>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '0.75rem', color: '#475569', fontSize: '0.8rem' }}>
                      {selectedSupplier?.id === supplier.id ? '▲ Hide products' : '▼ View products & order'}
                    </div>
                  </div>

                  {/* Expanded product list */}
                  {selectedSupplier?.id === supplier.id && (
                    <div style={{ padding: '0 1.5rem 1.5rem' }}>
                      <div style={{ borderTop: `1px solid ${colors.navy}`, paddingTop: '1rem' }}>
                        <h4 style={{ color: colors.orange, margin: '0 0 1rem 0', fontSize: '0.9rem', fontWeight: '700', letterSpacing: '0.05em' }}>AVAILABLE LICENSES</h4>
                        {supplier.products.map((product, idx) => (
                          <div key={idx} style={{ background: '#0a1628', border: `1px solid ${colors.navy}`, borderRadius: '0.6rem', padding: '1rem', marginBottom: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ color: '#fff', fontWeight: '600', fontSize: '0.95rem' }}>{product.name}</div>
                                <div style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '0.25rem' }}>{product.specs}</div>
                              </div>
                              <div style={{ textAlign: 'right', marginLeft: '1rem' }}>
                                <span style={{ color: colors.green, fontWeight: '700', fontSize: '1.1rem' }}>${product.price}</span>
                                <span style={{ color: '#64748b', fontSize: '0.78rem' }}>{product.unit}</span>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', alignItems: 'center' }}>
                              <label style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Seats:</label>
                              <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                style={{ width: '64px', padding: '0.4rem 0.5rem', background: '#1e293b', border: `1px solid ${colors.navy}`, borderRadius: '0.375rem', color: '#fff', fontSize: '0.9rem', textAlign: 'center' }}
                              />
                              <button
                                onClick={() => addToCart(supplier, product)}
                                style={{ flex: 1, padding: '0.5rem', background: colors.orange, color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.88rem', fontWeight: '700' }}
                              >
                                Add to Cart — ${(product.price * quantity).toFixed(2)}/mo
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Quick inquiry */}
                        <div style={{ background: '#0a1628', border: `1px solid ${colors.navy}`, borderRadius: '0.6rem', padding: '1rem', marginTop: '0.5rem' }}>
                          <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '0 0 0.75rem 0', fontWeight: '600' }}>Have questions? Send a direct inquiry to {supplier.name}:</p>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <input
                              placeholder="Your name *"
                              value={inquiryForm.contact_name}
                              onChange={e => setInquiryForm(f => ({ ...f, contact_name: e.target.value }))}
                              style={{ padding: '0.5rem', background: '#1e293b', border: `1px solid ${colors.navy}`, borderRadius: '0.375rem', color: '#fff', fontSize: '0.85rem' }}
                            />
                            <input
                              placeholder="Email *"
                              value={inquiryForm.email}
                              onChange={e => setInquiryForm(f => ({ ...f, email: e.target.value }))}
                              style={{ padding: '0.5rem', background: '#1e293b', border: `1px solid ${colors.navy}`, borderRadius: '0.375rem', color: '#fff', fontSize: '0.85rem' }}
                            />
                          </div>
                          <input
                            placeholder="Fleet size (optional)"
                            value={inquiryForm.fleet_size}
                            onChange={e => setInquiryForm(f => ({ ...f, fleet_size: e.target.value }))}
                            style={{ width: '100%', padding: '0.5rem', background: '#1e293b', border: `1px solid ${colors.navy}`, borderRadius: '0.375rem', color: '#fff', fontSize: '0.85rem', marginBottom: '0.5rem', boxSizing: 'border-box' }}
                          />
                          <textarea
                            placeholder="Your question or message..."
                            value={inquiryForm.message}
                            onChange={e => setInquiryForm(f => ({ ...f, message: e.target.value }))}
                            rows={2}
                            style={{ width: '100%', padding: '0.5rem', background: '#1e293b', border: `1px solid ${colors.navy}`, borderRadius: '0.375rem', color: '#fff', fontSize: '0.85rem', resize: 'vertical', boxSizing: 'border-box', marginBottom: '0.5rem' }}
                          />
                          <button
                            onClick={() => handleInquirySubmit(supplier.name)}
                            disabled={submitting}
                            style={{ width: '100%', padding: '0.5rem', background: colors.navy, color: '#fff', border: `1px solid ${colors.orange}`, borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.88rem', fontWeight: '600' }}
                          >
                            {submitting ? 'Sending…' : 'Send Inquiry'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CART TAB ── */}
        {activeTab === 'cart' && (
          <div>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', background: colors.cardBg, borderRadius: '1rem', border: `2px solid ${colors.green}` }}>
                <CheckCircle style={{ width: '64px', height: '64px', color: colors.green, margin: '0 auto 1.5rem' }} />
                <h2 style={{ color: '#fff', fontSize: '1.75rem', margin: '0 0 0.75rem 0' }}>Order Placed!</h2>
                <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
                  Your license order is confirmed. Drivers can download the TruckWithEase app right away — no hardware ships. You'll receive setup instructions within 1 hour.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setActiveTab('orders'); loadOrders(); }}
                  style={{ padding: '0.75rem 2rem', background: colors.orange, color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '700', fontSize: '1rem' }}
                >
                  View My Orders
                </button>
              </div>
            ) : cartItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', background: colors.cardBg, borderRadius: '1rem' }}>
                <ShoppingCart style={{ width: '56px', height: '56px', color: '#334155', margin: '0 auto 1rem' }} />
                <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Your cart is empty</h3>
                <p style={{ color: '#64748b' }}>Browse the Suppliers tab to add ELD licenses.</p>
                <button onClick={() => setActiveTab('suppliers')} style={{ marginTop: '1rem', padding: '0.65rem 1.5rem', background: colors.orange, color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '700' }}>
                  Browse Suppliers
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: '1.5rem', alignItems: 'start' }}>
                {/* Left: items */}
                <div>
                  <h3 style={{ color: '#fff', margin: '0 0 1rem 0' }}>License Selections ({cartItems.length})</h3>
                  {cartItems.map(item => (
                    <div key={item.id} style={{ background: colors.cardBg, border: `1px solid ${colors.navy}`, borderRadius: '0.75rem', padding: '1rem 1.25rem', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: colors.orange, fontWeight: '700', marginBottom: '0.2rem' }}>{item.product}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>from {item.supplier}</div>
                        <div style={{ color: '#cbd5e1', fontSize: '0.85rem', marginTop: '0.4rem' }}>{item.qty} seat{item.qty > 1 ? 's' : ''} × ${item.price.toFixed(2)}{item.unit}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: colors.green, fontWeight: '700', fontSize: '1.15rem', marginBottom: '0.5rem' }}>${item.total.toFixed(2)}/mo</div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          style={{ padding: '0.25rem 0.75rem', background: colors.red, color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right: checkout */}
                <div style={{ background: colors.cardBg, border: `2px solid ${colors.orange}`, borderRadius: '1rem', padding: '1.5rem' }}>
                  <h3 style={{ color: '#fff', margin: '0 0 1.25rem 0' }}>Complete Your Order</h3>

                  {[
                    { field: 'fleet_name', label: 'Fleet / Company Name *', placeholder: 'Your fleet name' },
                    { field: 'contact_name', label: 'Contact Name *', placeholder: 'Your full name' },
                    { field: 'email', label: 'Email *', placeholder: 'your@email.com' },
                    { field: 'phone', label: 'Phone', placeholder: 'Optional' },
                    { field: 'fleet_size', label: 'Fleet Size (drivers)', placeholder: 'e.g. 25' },
                    { field: 'ship_to_address', label: 'Mailing Address', placeholder: 'For records (no hardware ships)' }
                  ].map(({ field, label, placeholder }) => (
                    <div key={field} style={{ marginBottom: '0.75rem' }}>
                      <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.35rem' }}>{label}</label>
                      <input
                        type={field === 'email' ? 'email' : field === 'fleet_size' ? 'number' : 'text'}
                        placeholder={placeholder}
                        value={orderForm[field]}
                        onChange={e => setOrderForm(f => ({ ...f, [field]: e.target.value }))}
                        style={{ width: '100%', padding: '0.6rem 0.75rem', background: '#0a1628', border: `1px solid ${colors.navy}`, borderRadius: '0.5rem', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }}
                      />
                    </div>
                  ))}

                  <div style={{ borderTop: `1px solid ${colors.navy}`, margin: '1.25rem 0', paddingTop: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                      <span>Subtotal ({cartItems.length} items)</span>
                      <span>${cartTotal.toFixed(2)}/mo</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.green, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                      <span>Setup fee</span>
                      <span>Free</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontWeight: '700', fontSize: '1.1rem', marginTop: '0.75rem' }}>
                      <span>Total</span>
                      <span style={{ color: colors.green }}>${cartTotal.toFixed(2)}/mo</span>
                    </div>
                  </div>

                  <button
                    onClick={handleOrderSubmit}
                    disabled={submitting}
                    style={{ width: '100%', padding: '0.875rem', background: colors.orange, color: '#fff', border: 'none', borderRadius: '0.6rem', cursor: 'pointer', fontWeight: '800', fontSize: '1rem', letterSpacing: '0.02em' }}
                  >
                    {submitting ? 'Placing Order…' : 'Place Order'}
                  </button>

                  <div style={{ background: '#052e16', border: `1px solid #166534`, borderRadius: '0.5rem', padding: '0.75rem', marginTop: '1rem', fontSize: '0.82rem', color: '#86efac', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <CheckCircle style={{ width: '14px', height: '14px', flexShrink: 0, marginTop: '1px' }} />
                    <span>Software licenses activate instantly. Drivers download the app — nothing ships to your location.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ORDERS TAB ── */}
        {activeTab === 'orders' && (
          <div>
            <h3 style={{ color: '#fff', margin: '0 0 1.5rem 0' }}>Order History</h3>
            {loadingOrders ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading orders…</div>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', background: colors.cardBg, borderRadius: '1rem' }}>
                <FileText style={{ width: '48px', height: '48px', color: '#334155', margin: '0 auto 1rem' }} />
                <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No orders yet</h3>
                <p style={{ color: '#64748b' }}>Once you place an order, it will appear here.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {orders.map(order => (
                  <div key={order.id} style={{ background: colors.cardBg, border: `1px solid ${colors.navy}`, borderRadius: '0.75rem', padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div>
                        <div style={{ color: colors.orange, fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.3rem' }}>{order.order_number}</div>
                        <div style={{ color: '#fff', fontWeight: '600' }}>{order.product_name}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.2rem' }}>from {order.supplier_name} · {order.quantity} seat{order.quantity !== 1 ? 's' : ''}</div>
                        <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.2rem' }}>{order.fleet_name} · {order.email}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: colors.green, fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.4rem' }}>${order.total_price?.toFixed(2)}/mo</div>
                        <span style={{ background: statusColor(order.order_status) + '22', color: statusColor(order.order_status), border: `1px solid ${statusColor(order.order_status)}44`, padding: '0.25rem 0.65rem', borderRadius: '0.375rem', fontSize: '0.78rem', fontWeight: '700' }}>
                          {order.order_status || 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
