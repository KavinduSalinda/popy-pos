import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants';
import { LOGO_SRC } from '../brand';
import './HomePage.css';
import { CloudShader } from "@/components/ui/cloud-shader";

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'How it works', href: '#how' },
  { label: 'Contact', href: '#contact' },
];

const FEATURES = [
  {
    ln: 'LN 01 — INVENTORY',
    title: 'Live inventory sync',
    body: 'Stock updates the instant a sale rings up — across every register and every branch.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 8l-9-5-9 5 9 5 9-5z" />
        <path d="M3 8v8l9 5 9-5V8" />
        <path d="M12 13v8" />
      </svg>
    ),
  },
  {
    ln: 'LN 02 — BRANCHES',
    title: 'Multi-branch by default',
    body: 'Run one shop or twenty from a single dashboard, with per-location pricing and stock.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 9l9-7 9 7" />
        <path d="M9 22V12h6v10" />
        <path d="M4 22h16" />
      </svg>
    ),
  },
  {
    ln: 'LN 03 — REPORTING',
    title: 'Real-time reporting',
    body: "Know today's revenue, margin, and top sellers before you close the till.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 19V9" />
        <path d="M12 19V5" />
        <path d="M20 19v-7" />
      </svg>
    ),
  },
  {
    ln: 'LN 04 — PAYMENTS',
    title: 'Secure payments',
    body: 'Card, cash, and QR — reconciled automatically, with every transaction logged.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </svg>
    ),
  },
];

const STEPS = [
  {
    title: 'Set up your catalog',
    body: 'Import your products, prices, and stock — by spreadsheet or barcode scan.',
  },
  {
    title: 'Start selling',
    body: 'Ring up sales from any till or device, online or offline.',
  },
  {
    title: 'Track every branch',
    body: 'Watch sales, stock, and margin roll up in one live dashboard.',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'Stock across our two branches finally matches. We stopped over-ordering within the first month.',
    initials: 'NR',
    name: 'Nadeesha R.',
    role: 'Owner, Kandy General Store',
  },
  {
    quote:
      "Reporting used to take a spreadsheet and an hour. Now it's already there when I open the shop.",
    initials: 'SP',
    name: 'Sanjaya P.',
    role: 'Manager, Popy Market',
  },
  {
    quote: 'Support actually picks up. That alone was worth the switch from our old system.',
    initials: 'TW',
    name: 'Thilini W.',
    role: 'Owner, Fresh Corner',
  },
];

const PLANS = [
  {
    name: 'Starter',
    amount: 'LKR 4,900',
    period: '/mo',
    desc: 'For a single till, single location.',
    featured: false,
    items: [
      '1 branch, 2 registers',
      'Inventory tracking',
      'Daily sales reports',
      'Email support',
    ],
    cta: 'Choose Starter',
  },
  {
    name: 'Business',
    amount: 'LKR 12,900',
    period: '/mo',
    desc: 'For growing multi-branch shops.',
    featured: true,
    items: [
      'Up to 5 branches',
      'Real-time reporting',
      'Staff roles & permissions',
      'Priority support',
    ],
    cta: 'Choose Business',
  },
  {
    name: 'Enterprise',
    amount: 'Custom',
    period: '',
    desc: 'For chains with custom needs.',
    featured: false,
    items: [
      'Unlimited branches',
      'Dedicated account manager',
      'Custom integrations',
      'SLA-backed uptime',
    ],
    cta: 'Talk to sales',
  },
];

const RECEIPT_LINES = [
  { qty: '1x', name: 'Coca-Cola 1.5L', price: '420.00' },
  { qty: '2x', name: 'Anchor Milk Powder', price: '2,160.00' },
  { qty: '1x', name: 'Keeri Samba Rice 5kg', price: '2,400.00' },
  { qty: '3x', name: 'Signal Toothpaste', price: '1,140.00' },
];

const Brand = () => (
  <div className="brand">
    <span className="brand-mark">
      <img src={LOGO_SRC} alt="" />
    </span>
    Popy
  </div>
);

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const startTo = isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN;
  const startLabel = isAuthenticated ? 'Go to dashboard' : 'Get started';
  const loginLabel = isAuthenticated ? 'Open POS' : 'Log in';
  const loginTo = isAuthenticated ? ROUTES.POS : ROUTES.LOGIN;

  useEffect(() => {
    const nodes = document.querySelectorAll('.popy-home .reveal');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('in');
        });
      },
      { threshold: 0.12 },
    );
    nodes.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="popy-home">
      <header>
        <nav className="wrap">
          <a href="#top" aria-label="Popy home">
            <Brand />
          </a>
          <div className={`nav-links${menuOpen ? ' open' : ''}`}>
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
                {link.label}
              </a>
            ))}
          </div>
          <div className="nav-cta">
            <RouterLink to={loginTo} className="btn btn-ghost btn-sm">
              {loginLabel}
            </RouterLink>
            <RouterLink to={startTo} className="btn btn-primary btn-sm">
              {startLabel}
            </RouterLink>
            <button
              type="button"
              className="nav-toggle"
              aria-label="Open menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </nav>
      </header>

      <section className="hero relative" id="top">
      {/* <CloudShader className="absolute inset-0 z-0" /> */}
        <div className="wrap hero-grid relative z-10 from-primary to-primary-dark opacity-90">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              Point of sale, built for retail
            </div>
            <h1>
              Every sale, <em>accounted for.</em>
            </h1>
            <p className="lead">
              Popy runs your checkout, tracks your stock across every branch, and closes
              your books — reliably, down to every transaction.
            </p>
            <div className="hero-actions">
              <RouterLink to={startTo} className="btn btn-primary">
                Start free trial
              </RouterLink>
              <RouterLink to={loginTo} className="btn btn-ghost">
                Book a demo
              </RouterLink>
            </div>
            <div className="hero-note">
              <span>
                <span className="check">✓</span> No card required
              </span>
              <span>
                <span className="check">✓</span> Setup in under a day
              </span>
              <span>
                <span className="check">✓</span> Multi-branch ready
              </span>
            </div>
          </div>

          <div className="receipt-stage">
            <div className="receipt-shadow" />
            <div className="receipt">
              <div className="receipt-head">
                <div className="rmark">
                  <img src={LOGO_SRC} alt="" />
                </div>
                <div className="rname">POPY MARKET — MAIN</div>
                <div className="rsub">TXN #48213 · 09:41 AM</div>
              </div>
              <div className="receipt-divider" />
              <div className="rlines">
                {RECEIPT_LINES.map((line) => (
                  <div className="rline" key={line.name}>
                    <span>
                      <span className="rq">{line.qty}</span>
                      {line.name}
                    </span>
                    <span>{line.price}</span>
                  </div>
                ))}
              </div>
              <div className="receipt-divider" />
              <div className="rtotal">
                <span>TOTAL</span>
                <span>LKR 6,120.00</span>
              </div>
              <div className="rbarcode" />
              <div className="rstamp">APPROVED</div>
            </div>
          </div>
        </div>
      </section>

      <div className="trust">
        <div className="wrap trust-grid">
          <div>
            <div className="trust-num">500+</div>
            <div className="trust-label">Businesses running on Popy</div>
          </div>
          <div>
            <div className="trust-num">99.9%</div>
            <div className="trust-label">Uptime, every branch</div>
          </div>
          <div>
            <div className="trust-num">2.1M</div>
            <div className="trust-label">Transactions processed / mo</div>
          </div>
          <div>
            <div className="trust-num">24/7</div>
            <div className="trust-label">Human support</div>
          </div>
        </div>
      </div>

      <section id="features">
        <div className="wrap">
          <div className="section-head reveal">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              Features
            </div>
            <h2>Everything a checkout counter needs to run itself.</h2>
            <p>
              Four systems working from one shared ledger — so stock, sales, and reporting
              never drift out of sync.
            </p>
          </div>
          <div className="feat-grid reveal">
            {FEATURES.map((feature) => (
              <div className="feat-card" key={feature.ln}>
                <div className="feat-ln">{feature.ln}</div>
                <div className="feat-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="band">
        <div className="wrap">
          <div className="section-head reveal">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              Process
            </div>
            <h2>Live in three steps.</h2>
            <p>No IT team required — most shops are ringing up sales the same day.</p>
          </div>
          <div className="steps reveal">
            {STEPS.map((step, index) => (
              <div className="step" key={step.title}>
                <div className="step-num">0{index + 1}</div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="section-head reveal">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              Trusted by owners
            </div>
            <h2>What shop owners say after switching.</h2>
          </div>
          <div className="testi-grid reveal">
            {TESTIMONIALS.map((item) => (
              <div className="testi" key={item.name}>
                <p className="testi-quote">{item.quote}</p>
                <div className="testi-who">
                  <div className="testi-avatar">{item.initials}</div>
                  <div>
                    <div className="testi-name">{item.name}</div>
                    <div className="testi-role">{item.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="band">
        <div className="wrap">
          <div className="section-head reveal">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              Pricing
            </div>
            <h2>Straightforward plans, no surprise fees.</h2>
            <p>Every plan includes unlimited transactions and free support.</p>
          </div>
          <div className="price-grid reveal">
            {PLANS.map((plan) => (
              <div
                className={`price-card${plan.featured ? ' featured' : ''}`}
                key={plan.name}
              >
                {plan.featured ? <div className="price-tag">Most popular</div> : null}
                <div className="price-name">{plan.name}</div>
                <div className="price-amt">
                  {plan.amount}
                  {plan.period ? <span>{plan.period}</span> : null}
                </div>
                <p className="price-desc">{plan.desc}</p>
                <ul className="price-list">
                  {plan.items.map((item) => (
                    <li key={item}>✓ {item}</li>
                  ))}
                </ul>
                <RouterLink
                  to={startTo}
                  className={`btn ${plan.featured ? 'btn-primary' : 'btn-ghost'}`}
                >
                  {plan.cta}
                </RouterLink>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="cta-band reveal">
            <div>
              <h2>Trusted at every transaction.</h2>
              <p>
                Set up your first branch today — most shops are live and selling by the end
                of the day.
              </p>
            </div>
            <div className="cta-actions">
              <RouterLink to={startTo} className="btn btn-primary">
                Start free trial
              </RouterLink>
              <RouterLink to={loginTo} className="btn btn-ghost">
                Book a demo
              </RouterLink>
            </div>
          </div>
        </div>
      </section>

      <footer id="contact">
        <div className="wrap">
          <div className="foot-grid">
            <div className="foot-brand">
              <Brand />
              <p>
                Point-of-sale software for retail shops that run on trust — one till or a
                hundred.
              </p>
            </div>
            <div className="foot-col">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#how">How it works</a>
            </div>
            <div className="foot-col">
              <h4>Company</h4>
              <a href="#contact">About</a>
              <a href="#contact">Careers</a>
              <a href="#contact">Contact</a>
            </div>
            <div className="foot-col">
              <h4>Support</h4>
              <RouterLink to={loginTo}>Help center</RouterLink>
              <a href="#contact">Status</a>
              <a href="#contact">Privacy</a>
            </div>
          </div>
          <div className="foot-bottom">
            <p>© 2026 Popy. All rights reserved.</p>
            <div className="foot-social">
              <a href="#contact" aria-label="Facebook">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
              <a href="#contact" aria-label="Instagram">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" />
                </svg>
              </a>
              <a href="#contact" aria-label="LinkedIn">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                  <path d="M10 9v12" />
                  <path d="M10 13a4 4 0 018 0v8" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
