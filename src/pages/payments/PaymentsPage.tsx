import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight,
  TrendingUp, Clock, CheckCircle2, XCircle, AlertCircle, X,
  Banknote, BarChart3, Zap, Shield, ChevronRight, ArrowRight,
  RefreshCw, Download, Star
} from 'lucide-react';
import '../../styles/payments.css';

/* ─────────────────────────────────────────────────────── */
/* MOCK DATA                                               */
/* ─────────────────────────────────────────────────────── */

const WALLET_BALANCE = 42_850.00;
const PENDING_AMOUNT = 12_400.00;
const MONTHLY_CHANGE = '+18.4%';

interface Transaction {
  id: string;
  from: string;
  fromSub: string;
  to: string;
  toSub: string;
  amount: number;
  type: 'credit' | 'debit';
  status: 'success' | 'pending' | 'failed' | 'processing';
  date: string;
  txnId: string;
  category: string;
}

const TRANSACTIONS: Transaction[] = [
  { id: 't1', from: 'Alex Rivera', fromSub: 'External Transfer', to: 'Your Wallet', toSub: 'Nexus Account', amount: 1_200, type: 'debit', status: 'success', date: 'Oct 24, 2023', txnId: 'NEX-9921', category: 'External Transfer' },
  { id: 't2', from: 'Horizon VC Fund', fromSub: 'Investment Deposit', to: 'Your Wallet', toSub: 'Nexus Account', amount: 15_000, type: 'credit', status: 'pending', date: 'Oct 22, 2023', txnId: 'NEX-8812', category: 'Investment Deposit' },
  { id: 't3', from: 'Internal Wallet', fromSub: 'Conversion Fee', to: 'Your Wallet', toSub: '', amount: 45.00, type: 'debit', status: 'failed', date: 'Oct 20, 2023', txnId: 'NEX-8401', category: 'Fee' },
  { id: 't4', from: 'AWS Cloud Services', fromSub: 'SaaS Subscription', to: 'Your Wallet', toSub: '', amount: 640, type: 'debit', status: 'success', date: 'Oct 18, 2023', txnId: 'NEX-7742', category: 'SaaS Subscription' },
  { id: 't5', from: 'Stripe Disbursement', fromSub: 'Monthly Payout', to: 'Your Wallet', toSub: 'Nexus Account', amount: 12_400, type: 'credit', status: 'success', date: 'Oct 24, 2023', txnId: 'NEX-9921', category: 'Stripe Payout' },
  { id: 't6', from: 'Venture Seed Fund', fromSub: 'Series A Tranche', to: 'Your Wallet', toSub: 'Nexus Account', amount: 500_000, type: 'credit', status: 'success', date: 'Oct 19, 2023', txnId: 'NEX-7742', category: 'Investment Deposit' },
  { id: 't7', from: 'Document Chamber', fromSub: 'Cloud Storage Fee', to: 'Your Wallet', toSub: '', amount: 15.99, type: 'debit', status: 'processing', date: 'Oct 12, 2023', txnId: 'NEX-7100', category: 'Storage Fee' },
];

interface FundingDeal {
  id: string;
  company: string;
  description: string;
  target: number;
  raised: number;
  investors: number;
  logoColor: string;
  logoChar: string;
  stage: string;
  role: 'investor' | 'entrepreneur';
}

const FUNDING_DEALS: FundingDeal[] = [
  { id: 'fd1', company: 'Quantum Analytics', description: 'AI-driven predictive logistics for global supply chains.', target: 2_000_000, raised: 1_340_000, investors: 12, logoColor: '#4338ca', logoChar: 'QA', stage: 'Series A', role: 'investor' },
  { id: 'fd2', company: 'GreenGrid Pro', description: 'Sustainable urban farming infrastructure for smart cities.', target: 800_000, raised: 520_000, investors: 8, logoColor: '#16a34a', logoChar: 'GG', stage: 'Seed', role: 'investor' },
];

const QUICK_AMOUNTS = [500, 1000, 5000, 10000, 25000];
const PAYMENT_METHODS = [
  { id: 'visa', name: 'Visa •••• 4242', sub: 'Credit Card', logo: '💳' },
  { id: 'bank', name: 'Bank Transfer (ACH)', sub: 'Chase Bank ••4821', logo: '🏦' },
];
const DESTINATION_ACCOUNTS = [
  { id: 'chase', name: 'Chase •••• 4821', bank: 'Chase Bank', arrival: '1–2 business days', logo: '🏦' },
  { id: 'bofa', name: 'BoA •••• 3341', bank: 'Bank of America', arrival: '2–3 business days', logo: '🏦' },
];
const RECENT_RECIPIENTS = [
  { id: 'r1', name: 'Alex Rivera', initials: 'AR', color: '#4338ca' },
  { id: 'r2', name: 'Horizon VC', initials: 'HV', color: '#0ea5e9' },
  { id: 'r3', name: 'Sarah Chen', initials: 'SC', color: '#16a34a' },
  { id: 'r4', name: 'David Kim', initials: 'DK', color: '#b45309' },
];

/* ─────────────────────────────────────────────────────── */
/* HELPERS                                                 */
/* ─────────────────────────────────────────────────────── */

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

function avatarColors(name: string) {
  const palette = [
    ['#eef2ff', '#4338ca'], ['#f0fdf4', '#16a34a'], ['#fffbeb', '#b45309'],
    ['#fef2f2', '#dc2626'], ['#eff6ff', '#2563eb'], ['#fdf4ff', '#a21caf'],
  ];
  const idx = name.charCodeAt(0) % palette.length;
  return { bg: palette[idx][0], color: palette[idx][1] };
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function StatusBadge({ status }: { status: Transaction['status'] }) {
  const map: Record<string, [string, string]> = {
    success: ['pay-badge pay-badge-success', 'Completed'],
    pending: ['pay-badge pay-badge-pending', 'Pending'],
    failed: ['pay-badge pay-badge-failed', 'Failed'],
    processing: ['pay-badge pay-badge-processing', 'Processing'],
  };
  const [cls, label] = map[status] ?? ['pay-badge', status];
  return <span className={cls}>{label}</span>;
}

/* ─────────────────────────────────────────────────────── */
/* ACTION PANEL (Deposit / Withdraw / Transfer)            */
/* Stitch-exact: slides down below the wallet hero card   */
/* ─────────────────────────────────────────────────────── */

type ActiveTab = 'deposit' | 'withdraw' | 'transfer';

interface ActionPanelProps {
  activeTab: ActiveTab;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
}

function ActionPanel({ activeTab, onClose, onSuccess, setBalance }: ActionPanelProps) {
  const [tab, setTab] = useState<ActiveTab>(activeTab);
  const [amount, setAmount] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('visa');
  const [selectedDest, setSelectedDest] = useState('chase');
  const [recipient, setRecipient] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const numAmount = parseFloat(amount) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numAmount) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
      if (tab === 'deposit') {
        setBalance(b => b + numAmount);
        onSuccess(`${fmt(numAmount)} deposited successfully!`);
      } else if (tab === 'withdraw') {
        setBalance(b => Math.max(0, b - numAmount));
        onSuccess(`${fmt(numAmount)} withdrawal initiated.`);
      } else {
        setBalance(b => Math.max(0, b - numAmount));
        onSuccess(`${fmt(numAmount)} sent to ${recipient || 'recipient'}.`);
      }
      setTimeout(() => { setDone(false); setAmount(''); setNote(''); setRecipient(''); onClose(); }, 2000);
    }, 1500);
  };

  const tabs = [
    { id: 'deposit' as ActiveTab, label: 'Deposit', icon: <ArrowDownToLine size={18} /> },
    { id: 'withdraw' as ActiveTab, label: 'Withdraw', icon: <ArrowUpFromLine size={18} /> },
    { id: 'transfer' as ActiveTab, label: 'Transfer', icon: <ArrowLeftRight size={18} /> },
  ];

  const getSummary = () => {
    if (!numAmount) return null;
    if (tab === 'deposit') {
      const m = PAYMENT_METHODS.find(m => m.id === selectedPayment);
      return `Depositing ${fmt(numAmount)} via ${m?.name}`;
    }
    if (tab === 'withdraw') {
      const d = DESTINATION_ACCOUNTS.find(d => d.id === selectedDest);
      return `Withdrawing ${fmt(numAmount)} to ${d?.bank}`;
    }
    return `Sending ${fmt(numAmount)} to ${recipient || '—'}`;
  };

  return (
    <div className="stitch-action-panel">
      {/* Panel header with tabs */}
      <div className="stitch-panel-header">
        <div className="stitch-panel-tabs">
          {tabs.map(t => (
            <button
              key={t.id}
              type="button"
              className={`stitch-panel-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => { setTab(t.id); setAmount(''); }}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>
        <button className="stitch-panel-close" onClick={onClose} type="button" aria-label="Close">
          <X size={18} />
        </button>
      </div>

      <form className="stitch-panel-body" onSubmit={handleSubmit}>
        {done ? (
          /* ── Success state ── */
          <div className="stitch-success-state">
            <div className="stitch-success-icon">
              <CheckCircle2 size={36} />
            </div>
            <div className="stitch-success-title">Transaction Successful</div>
            <div className="stitch-success-sub">{fmt(numAmount)} {tab === 'deposit' ? 'added to' : 'removed from'} your wallet</div>
          </div>
        ) : (
          <>
            {/* ── Hero amount input ── */}
            <div className="stitch-amount-wrap">
              <label className="stitch-field-label">
                {tab === 'deposit' ? 'Amount to Deposit' : tab === 'withdraw' ? 'Amount to Withdraw' : 'Amount to Send'}
              </label>
              <div className="stitch-amount-row">
                <span className="stitch-currency">$</span>
                <input
                  className="stitch-amount-input"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="stitch-amount-underline" />
              {/* Quick selects */}
              <div className="stitch-quick-row">
                {QUICK_AMOUNTS.map(v => (
                  <button
                    key={v}
                    type="button"
                    className={`stitch-quick-chip ${parseFloat(amount) === v ? 'active' : ''}`}
                    onClick={() => setAmount(v.toString())}
                  >
                    {v >= 1000 ? `$${v / 1000}K` : `$${v}`}
                  </button>
                ))}
              </div>
            </div>

            {/* ── DEPOSIT: payment method selector ── */}
            {tab === 'deposit' && (
              <div className="stitch-field-group">
                <label className="stitch-field-label">Payment Method</label>
                <div className="stitch-selectors">
                  {PAYMENT_METHODS.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      className={`stitch-selector-row ${selectedPayment === m.id ? 'active' : ''}`}
                      onClick={() => setSelectedPayment(m.id)}
                    >
                      <span className="stitch-selector-logo">{m.logo}</span>
                      <div className="stitch-selector-info">
                        <span className="stitch-selector-name">{m.name}</span>
                        <span className="stitch-selector-sub">{m.sub}</span>
                      </div>
                      {selectedPayment === m.id && <CheckCircle2 size={18} className="stitch-selector-check" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── WITHDRAW: destination account ── */}
            {tab === 'withdraw' && (
              <div className="stitch-field-group">
                <label className="stitch-field-label">Withdraw To</label>
                <div className="stitch-selectors">
                  {DESTINATION_ACCOUNTS.map(d => (
                    <button
                      key={d.id}
                      type="button"
                      className={`stitch-selector-row ${selectedDest === d.id ? 'active' : ''}`}
                      onClick={() => setSelectedDest(d.id)}
                    >
                      <span className="stitch-selector-logo">{d.logo}</span>
                      <div className="stitch-selector-info">
                        <span className="stitch-selector-name">{d.name}</span>
                        <span className="stitch-selector-sub">Est. {d.arrival}</span>
                      </div>
                      {selectedDest === d.id && <CheckCircle2 size={18} className="stitch-selector-check" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── TRANSFER: recipient ── */}
            {tab === 'transfer' && (
              <div className="stitch-field-group">
                <label className="stitch-field-label">Send To</label>
                <div className="stitch-recent-bubbles">
                  {RECENT_RECIPIENTS.map(r => (
                    <button
                      key={r.id}
                      type="button"
                      className={`stitch-bubble ${recipient === r.name ? 'active' : ''}`}
                      onClick={() => setRecipient(r.name)}
                      title={r.name}
                    >
                      <div className="stitch-bubble-avatar" style={{ background: r.color }}>{r.initials}</div>
                      <span className="stitch-bubble-name">{r.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
                <input
                  className="stitch-text-input"
                  type="text"
                  placeholder="Or search by name / wallet ID…"
                  value={recipient}
                  onChange={e => setRecipient(e.target.value)}
                  required
                />
              </div>
            )}

            {/* ── Note field ── */}
            <div className="stitch-field-group">
              <label className="stitch-field-label">Note <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span></label>
              <input
                className="stitch-text-input"
                type="text"
                placeholder={tab === 'deposit' ? 'e.g. Investment tranche' : tab === 'withdraw' ? 'e.g. Monthly withdrawal' : 'e.g. Q3 milestone payment'}
                value={note}
                onChange={e => setNote(e.target.value)}
              />
            </div>

            {/* ── Summary line ── */}
            {getSummary() && (
              <div className="stitch-summary-line">
                <Shield size={13} />
                <span>{getSummary()}</span>
              </div>
            )}

            {/* ── Submit ── */}
            <button className="stitch-submit-btn" type="submit" disabled={loading || !numAmount}>
              {loading
                ? <><RefreshCw size={17} className="animate-spin" /> Processing…</>
                : <>
                    {tab === 'deposit' ? 'Deposit Funds' : tab === 'withdraw' ? 'Withdraw Funds' : 'Send Transfer'}
                    <ChevronRight size={17} />
                  </>
              }
            </button>

            <p className="stitch-security-note">
              <Shield size={11} /> 256-bit TLS encrypted · FDIC mock-simulated · No real funds moved
            </p>
          </>
        )}
      </form>
    </div>
  );
}

/* ─────────────────────────────────────────────────────── */
/* TRANSACTION HISTORY TABLE                               */
/* ─────────────────────────────────────────────────────── */

function TransactionHistory({ txns }: { txns: Transaction[] }) {
  const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all');

  const visible = txns.filter(t =>
    filter === 'all' ? true : t.type === filter
  );

  return (
    <div className="pay-section-card">
      <div className="pay-section-header">
        <h2 className="pay-section-title">
          <BarChart3 size={18} className="text-indigo-500" />
          Transaction History
        </h2>
        <div className="pay-tabs" style={{ padding: '0.15rem' }}>
          {(['all', 'credit', 'debit'] as const).map(f => (
            <button
              key={f}
              type="button"
              className={`pay-tab ${filter === f ? 'active' : ''}`}
              style={{ minWidth: 60 }}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="pay-table-scroll">
        {visible.length === 0 ? (
          <div className="pay-empty">
            <div className="pay-empty-icon"><AlertCircle size={22} /></div>
            <p>No transactions found</p>
          </div>
        ) : (
          <table className="pay-txn-table">
            <thead>
              <tr>
                <th>Sender / Receiver</th>
                <th className="hide-mobile">Date · ID</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(t => {
                const av = avatarColors(t.from);
                return (
                  <tr key={t.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div className="txn-avatar" style={{ background: av.bg, color: av.color }}>
                          {initials(t.from)}
                        </div>
                        <div>
                          <div className="txn-name">{t.from}</div>
                          <div className="txn-sub">{t.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="hide-mobile">
                      <div className="txn-sub">{t.date}</div>
                      <div className="txn-id">ID: {t.txnId}</div>
                    </td>
                    <td><StatusBadge status={t.status} /></td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={`txn-amount ${t.type === 'credit' ? 'txn-amount-credit' : 'txn-amount-debit'}`}>
                        {t.type === 'credit' ? '+' : '−'}{fmt(t.amount)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ padding: '0.75rem 1.5rem', borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
        <button className="pay-link-btn" style={{ fontSize: '0.875rem' }}>
          View All Transactions
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────── */
/* FUNDING DEAL CARD                                       */
/* ─────────────────────────────────────────────────────── */

function FundingDealCard({ deal, onFund }: { deal: FundingDeal; onFund: (d: FundingDeal) => void }) {
  const pct = Math.round((deal.raised / deal.target) * 100);
  return (
    <div className="funding-deal-card">
      <div className="funding-deal-header">
        <div className="deal-logo" style={{ background: deal.logoColor }}>{deal.logoChar}</div>
        <div style={{ flex: 1 }}>
          <div className="deal-info-name">{deal.company}</div>
          <div className="deal-info-desc">{deal.description}</div>
        </div>
        <span className="pay-badge" style={{ background: '#eef2ff', color: '#4338ca', flexShrink: 0 }}>{deal.stage}</span>
      </div>
      <div className="deal-progress-wrap">
        <div className="deal-progress-bar-bg">
          <div className="deal-progress-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="deal-progress-text">
          <span>Target: {fmt(deal.target)}</span>
          <span className="deal-progress-pct">{pct}%</span>
        </div>
      </div>
      <button className="deal-fund-btn" onClick={() => onFund(deal)}>
        <Zap size={14} />
        {deal.role === 'investor' ? 'Fund This Deal' : 'View My Deal'}
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────── */
/* FUND FLOW MODAL (Investor → Entrepreneur)               */
/* ─────────────────────────────────────────────────────── */

function FundModal({ deal, onClose, onConfirm }: { deal: FundingDeal; onClose: () => void; onConfirm: (deal: FundingDeal, amount: number) => void }) {
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'form' | 'review' | 'done'>('form');
  const proceed = (e: React.FormEvent) => { e.preventDefault(); if (Number(amount) > 0) setStep('review'); };
  const confirm = () => { setStep('done'); setTimeout(() => { onConfirm(deal, Number(amount)); onClose(); }, 1800); };

  return (
    <div className="fund-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="fund-modal">
        <div className="fund-modal-header">
          <h3>{step === 'done' ? '✓ Funding Confirmed' : `Fund ${deal.company}`}</h3>
          <button className="fund-modal-close" onClick={onClose} type="button"><X size={16} /></button>
        </div>

        <div className="fund-modal-body">
          {step === 'form' && (
            <>
              <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div className="deal-logo" style={{ background: deal.logoColor, width: 44, height: 44, fontSize: '0.8rem' }}>{deal.logoChar}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#111827' }}>{deal.company}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{deal.stage} · {deal.investors} investors</div>
                </div>
              </div>
              <div className="fund-flow-step active">
                <div className="fund-step-icon indigo"><Wallet size={16} /></div>
                <div><div className="fund-step-label">Investor Wallet</div><div className="fund-step-sub">Your Nexus wallet</div></div>
                <ArrowRight size={16} style={{ marginLeft: 'auto', color: '#6366f1' }} />
              </div>
              <div className="fund-flow-step">
                <div className="fund-step-icon amber"><Shield size={16} /></div>
                <div><div className="fund-step-label">Nexus Escrow</div><div className="fund-step-sub">Secured until milestones met</div></div>
                <ArrowRight size={16} style={{ marginLeft: 'auto', color: '#d1d5db' }} />
              </div>
              <div className="fund-flow-step">
                <div className="fund-step-icon green"><Banknote size={16} /></div>
                <div><div className="fund-step-label">Entrepreneur Wallet</div><div className="fund-step-sub">{deal.company} · {deal.stage} round</div></div>
              </div>
              <form onSubmit={proceed}>
                <div className="pay-input-group">
                  <label>Your Investment Amount (USD)</label>
                  <div className="pay-input-amount">
                    <span className="pay-input-amount-prefix">$</span>
                    <input className="pay-input" type="number" min="100" step="100" placeholder="10,000" value={amount} onChange={e => setAmount(e.target.value)} required autoFocus />
                  </div>
                </div>
                <div className="fund-modal-footer" style={{ padding: '1rem 0 0', border: 'none' }}>
                  <button className="fund-modal-btn-cancel" type="button" onClick={onClose}>Cancel</button>
                  <button className="fund-modal-btn-confirm" type="submit">Review Investment <ChevronRight size={15} style={{ display: 'inline' }} /></button>
                </div>
              </form>
            </>
          )}
          {step === 'review' && (
            <>
              <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#111827' }}>{fmt(Number(amount))}</div>
                <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>Investment into {deal.company}</div>
              </div>
              <div className="fund-flow-step completed"><div className="fund-step-icon indigo"><Wallet size={16} /></div><div><div className="fund-step-label">From: Your Wallet</div></div><CheckCircle2 size={16} style={{ marginLeft: 'auto', color: '#16a34a' }} /></div>
              <div className="fund-flow-step completed"><div className="fund-step-icon amber"><Shield size={16} /></div><div><div className="fund-step-label">Via: Nexus Escrow</div></div><CheckCircle2 size={16} style={{ marginLeft: 'auto', color: '#16a34a' }} /></div>
              <div className="fund-flow-step active"><div className="fund-step-icon green"><Banknote size={16} /></div><div><div className="fund-step-label">To: {deal.company}</div><div className="fund-step-sub">Pending confirmation</div></div><Clock size={16} style={{ marginLeft: 'auto', color: '#b45309' }} /></div>
              <div className="fund-modal-footer" style={{ padding: '1rem 0 0', border: 'none' }}>
                <button className="fund-modal-btn-cancel" type="button" onClick={() => setStep('form')}>← Back</button>
                <button className="fund-modal-btn-confirm" type="button" onClick={confirm}>✓ Confirm Investment</button>
              </div>
            </>
          )}
          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{ width: 64, height: 64, background: '#d1fae5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <CheckCircle2 size={32} color="#16a34a" />
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>Investment Successful!</div>
              <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.35rem' }}>{fmt(Number(amount))} sent to {deal.company}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────── */
/* MAIN PAGE                                               */
/* ─────────────────────────────────────────────────────── */

export const PaymentsPage: React.FC = () => {
  const [balance, setBalance] = useState(WALLET_BALANCE);
  const [transactions, setTransactions] = useState(TRANSACTIONS);
  const [toast, setToast] = useState<string | null>(null);
  const [fundDeal, setFundDeal] = useState<FundingDeal | null>(null);
  const [activeAction, setActiveAction] = useState<ActiveTab | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleFundConfirm = (deal: FundingDeal, amount: number) => {
    const newTxn: Transaction = {
      id: `t${Date.now()}`,
      from: 'Your Wallet', fromSub: 'Nexus Account',
      to: deal.company, toSub: `${deal.stage} Investment`,
      amount, type: 'debit', status: 'processing',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      txnId: `NEX-${Math.floor(Math.random() * 9000 + 1000)}`,
      category: 'Investment Deposit',
    };
    setTransactions(prev => [newTxn, ...prev]);
    setBalance(b => Math.max(0, b - amount));
    showToast(`${fmt(amount)} invested in ${deal.company}!`);
  };

  return (
    <div className="payments-page">

      {/* ── Page header ── */}
      <div className="payments-header">
        <div>
          <h1>Financial Overview</h1>
          <p>Manage your assets, funding deals, and transaction history.</p>
        </div>
        <button
          className="stitch-export-btn"
          onClick={() => showToast('Report exported!')}
          type="button"
        >
          <Download size={15} /> Export Report
        </button>
      </div>

      {/* ── Wallet hero card (Stitch desktop style) ── */}
      <div className="stitch-wallet-card">
        {/* Left: balance block */}
        <div className="stitch-wallet-left">
          <div className="stitch-wallet-label">
            <Wallet size={13} /> TOTAL WALLET BALANCE
          </div>
          <div className="stitch-wallet-balance">{fmt(balance)}</div>
          <div className="stitch-wallet-sub">
            <TrendingUp size={13} />
            <span className="stitch-wallet-sub-positive">{MONTHLY_CHANGE}</span>
            <span>vs. last 30 days</span>
          </div>

          {/* ── Action buttons – Desktop style (Stitch exact) ── */}
          <div className="stitch-wallet-actions">
            <button
              className={`stitch-action-btn stitch-action-btn-primary ${activeAction === 'deposit' ? 'active-panel' : ''}`}
              onClick={() => setActiveAction(activeAction === 'deposit' ? null : 'deposit')}
              type="button"
            >
              <ArrowDownToLine size={15} />
              <span>Deposit</span>
            </button>
            <button
              className={`stitch-action-btn stitch-action-btn-outline ${activeAction === 'withdraw' ? 'active-panel' : ''}`}
              onClick={() => setActiveAction(activeAction === 'withdraw' ? null : 'withdraw')}
              type="button"
            >
              <ArrowUpFromLine size={15} />
              <span>Withdraw</span>
            </button>
            <button
              className={`stitch-action-btn stitch-action-btn-outline ${activeAction === 'transfer' ? 'active-panel' : ''}`}
              onClick={() => setActiveAction(activeAction === 'transfer' ? null : 'transfer')}
              type="button"
            >
              <ArrowLeftRight size={15} />
              <span>Transfer</span>
            </button>
          </div>
        </div>

        {/* Right: locked funds + monthly growth (Stitch desktop) */}
        <div className="stitch-wallet-right">
          <div className="stitch-wallet-right-card stitch-locked-card">
            <div className="stitch-rcard-label">LOCKED FUNDS</div>
            <div className="stitch-rcard-value">{fmt(PENDING_AMOUNT)}</div>
            <div className="stitch-rcard-sub">Awaiting deal completion</div>
          </div>
          <div className="stitch-wallet-right-card stitch-growth-card">
            <div className="stitch-rcard-label">MONTHLY GROWTH</div>
            <div className="stitch-rcard-value stitch-growth-value">{MONTHLY_CHANGE}</div>
            <div className="stitch-rcard-sub">vs. last 30 days</div>
          </div>
        </div>

        {/* ── Tablet icon action cards (inside card, 3 cols) ── */}
        <div className="stitch-tablet-actions">
          {[
            { id: 'deposit' as ActiveTab, label: 'Deposit', icon: <ArrowDownToLine size={24} /> },
            { id: 'transfer' as ActiveTab, label: 'Transfer', icon: <ArrowLeftRight size={24} /> },
            { id: 'withdraw' as ActiveTab, label: 'Withdraw', icon: <ArrowUpFromLine size={24} /> },
          ].map(a => (
            <button
              key={a.id}
              type="button"
              className={`stitch-tablet-action-card ${activeAction === a.id ? 'active' : ''}`}
              onClick={() => setActiveAction(activeAction === a.id ? null : a.id)}
            >
              <div className="stitch-tablet-action-icon">{a.icon}</div>
              <span className="stitch-tablet-action-label">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Action Panel (slides in below wallet card) ── */}
      {activeAction && (
        <ActionPanel
          activeTab={activeAction}
          onClose={() => setActiveAction(null)}
          onSuccess={showToast}
          setBalance={setBalance}
        />
      )}

      {/* ── KPI strip ── */}
      <div className="payments-kpi-strip">
        <div className="pay-stat-card">
          <div className="pay-stat-icon indigo"><TrendingUp size={20} /></div>
          <div><div className="pay-stat-label">Total Funded</div><div className="pay-stat-value">$1.84M</div></div>
        </div>
        <div className="pay-stat-card">
          <div className="pay-stat-icon green"><CheckCircle2 size={20} /></div>
          <div><div className="pay-stat-label">Successful Txns</div><div className="pay-stat-value">{transactions.filter(t => t.status === 'success').length}</div></div>
        </div>
        <div className="pay-stat-card">
          <div className="pay-stat-icon amber"><Clock size={20} /></div>
          <div><div className="pay-stat-label">Pending</div><div className="pay-stat-value">{transactions.filter(t => t.status === 'pending' || t.status === 'processing').length}</div></div>
        </div>
        <div className="pay-stat-card">
          <div className="pay-stat-icon blue"><XCircle size={20} /></div>
          <div><div className="pay-stat-label">Failed</div><div className="pay-stat-value">{transactions.filter(t => t.status === 'failed').length}</div></div>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="payments-grid">

        {/* LEFT: Transaction History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <TransactionHistory txns={transactions} />
        </div>

        {/* RIGHT: Active funding deals + escrow info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="pay-section-card">
            <div className="pay-section-header">
              <h2 className="pay-section-title">
                <Star size={18} className="text-amber-500" style={{ color: '#f59e0b' }} />
                Active Funding Deals
              </h2>
              <Link to="/deals" className="pay-link-btn">View all</Link>
            </div>
            <div className="pay-section-body" style={{ paddingTop: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '1rem' }}>
                {FUNDING_DEALS.map(deal => (
                  <FundingDealCard key={deal.id} deal={deal} onFund={setFundDeal} />
                ))}
              </div>
            </div>
            {/* New Funding Deal button — Stitch tablet CTA */}
            <div style={{ padding: '0 1.25rem 1.25rem' }}>
              <Link
                to="/deals"
                className="stitch-new-deal-btn"
              >
                <Zap size={16} /> New Funding Deal
              </Link>
            </div>
          </div>

          <div className="pay-section-card" style={{ background: 'linear-gradient(135deg,#fdf4ff,#ede9fe)', border: '1.5px solid #ddd6fe' }}>
            <div className="pay-section-body">
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div className="pay-stat-icon" style={{ background: '#ddd6fe', color: '#7c3aed', width: 44, height: 44, flexShrink: 0 }}>
                  <Shield size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#111827', marginBottom: '0.25rem' }}>Nexus Escrow Protection</div>
                  <p style={{ fontSize: '0.78rem', color: '#6b7280', lineHeight: 1.5, margin: 0 }}>
                    All funding deals route through Nexus Escrow. Funds are released only when deal milestones are verified.
                  </p>
                  <Link to="/deals" style={{ fontSize: '0.78rem', fontWeight: 600, color: '#7c3aed', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem', textDecoration: 'none' }}>
                    Learn more <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Fund deal modal ── */}
      {fundDeal && (
        <FundModal deal={fundDeal} onClose={() => setFundDeal(null)} onConfirm={handleFundConfirm} />
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="pay-toast">
          <div className="pay-toast-icon"><CheckCircle2 size={18} /></div>
          <div>
            <div className="pay-toast-title">Success</div>
            <div className="pay-toast-sub">{toast}</div>
          </div>
        </div>
      )}
    </div>
  );
};
