import { useEffect, useState, type ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants';
import { LOGO_SRC } from '../brand';
import './HomePage.css';

const NAV_LINKS = [
  { key: 'features', href: '#features' },
  { key: 'pricing', href: '#pricing' },
  { key: 'how', href: '#how' },
  { key: 'contact', href: '#contact' },
] as const;

const FEATURE_KEYS = ['inventory', 'branches', 'reporting', 'payments'] as const;

const FEATURE_ICONS: Record<(typeof FEATURE_KEYS)[number], ReactNode> = {
  inventory: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 8l-9-5-9 5 9 5 9-5z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </svg>
  ),
  branches: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 9l9-7 9 7" />
      <path d="M9 22V12h6v10" />
      <path d="M4 22h16" />
    </svg>
  ),
  reporting: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 19V9" />
      <path d="M12 19V5" />
      <path d="M20 19v-7" />
    </svg>
  ),
  payments: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  ),
};

const STEP_KEYS = ['step1', 'step2', 'step3'] as const;

const TESTIMONIALS = [
  { key: 'one', initials: 'NR', name: 'Nadeesha R.' },
  { key: 'two', initials: 'SP', name: 'Sanjaya P.' },
  { key: 'three', initials: 'TW', name: 'Thilini W.' },
] as const;

const PLANS = [
  { key: 'starter', amount: 'LKR 4,900', featured: false },
  { key: 'business', amount: 'LKR 12,900', featured: true },
  { key: 'enterprise', amount: null, featured: false },
] as const;

const PLAN_ITEMS = ['item1', 'item2', 'item3', 'item4'] as const;

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
  const { t } = useTranslation('home');
  const { isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const startTo = isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN;
  const startLabel = isAuthenticated ? t('nav.goDashboard') : t('nav.getStarted');
  const loginLabel = isAuthenticated ? t('nav.openPos') : t('nav.login');
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
          <a href="#top" aria-label={t('nav.homeAria')}>
            <Brand />
          </a>
          <div className={`nav-links${menuOpen ? ' open' : ''}`}>
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
                {t(`nav.${link.key}`)}
              </a>
            ))}
          </div>
          <div className="nav-cta">
            <LanguageSwitcher />
            <RouterLink to={loginTo} className="btn btn-ghost btn-sm">
              {loginLabel}
            </RouterLink>
            <RouterLink to={startTo} className="btn btn-primary btn-sm">
              {startLabel}
            </RouterLink>
            <button
              type="button"
              className="nav-toggle"
              aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </nav>
      </header>

      <section className="hero relative" id="top">
        <div className="wrap hero-grid relative z-10 from-primary to-primary-dark opacity-90">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              {t('hero.eyebrow')}
            </div>
            <h1>
              <Trans i18nKey="hero.title" ns="home" components={{ em: <em /> }} />
            </h1>
            <p className="lead">{t('hero.lead')}</p>
            <div className="hero-actions">
              <RouterLink to={startTo} className="btn btn-primary">
                {t('hero.startTrial')}
              </RouterLink>
              <RouterLink to={loginTo} className="btn btn-ghost">
                {t('hero.bookDemo')}
              </RouterLink>
            </div>
            <div className="hero-note">
              <span>
                <span className="check">✓</span> {t('hero.noCard')}
              </span>
              <span>
                <span className="check">✓</span> {t('hero.setupFast')}
              </span>
              <span>
                <span className="check">✓</span> {t('hero.multiBranch')}
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
                <div className="rname">{t('receipt.shop')}</div>
                <div className="rsub">{t('receipt.txn')}</div>
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
                <span>{t('receipt.total')}</span>
                <span>LKR 6,120.00</span>
              </div>
              <div className="rbarcode" />
              <div className="rstamp">{t('receipt.approved')}</div>
            </div>
          </div>
        </div>
      </section>

      <div className="trust">
        <div className="wrap trust-grid">
          <div>
            <div className="trust-num">500+</div>
            <div className="trust-label">{t('trust.businesses')}</div>
          </div>
          <div>
            <div className="trust-num">99.9%</div>
            <div className="trust-label">{t('trust.uptime')}</div>
          </div>
          <div>
            <div className="trust-num">2.1M</div>
            <div className="trust-label">{t('trust.transactions')}</div>
          </div>
          <div>
            <div className="trust-num">24/7</div>
            <div className="trust-label">{t('trust.support')}</div>
          </div>
        </div>
      </div>

      <section id="features">
        <div className="wrap">
          <div className="section-head reveal">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              {t('features.eyebrow')}
            </div>
            <h2>{t('features.title')}</h2>
            <p>{t('features.lead')}</p>
          </div>
          <div className="feat-grid reveal">
            {FEATURE_KEYS.map((key) => (
              <div className="feat-card" key={key}>
                <div className="feat-ln">{t(`features.${key}.ln`)}</div>
                <div className="feat-icon">{FEATURE_ICONS[key]}</div>
                <h3>{t(`features.${key}.title`)}</h3>
                <p>{t(`features.${key}.body`)}</p>
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
              {t('how.eyebrow')}
            </div>
            <h2>{t('how.title')}</h2>
            <p>{t('how.lead')}</p>
          </div>
          <div className="steps reveal">
            {STEP_KEYS.map((key, index) => (
              <div className="step" key={key}>
                <div className="step-num">0{index + 1}</div>
                <h3>{t(`how.${key}.title`)}</h3>
                <p>{t(`how.${key}.body`)}</p>
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
              {t('testimonials.eyebrow')}
            </div>
            <h2>{t('testimonials.title')}</h2>
          </div>
          <div className="testi-grid reveal">
            {TESTIMONIALS.map((item) => (
              <div className="testi" key={item.key}>
                <p className="testi-quote">{t(`testimonials.${item.key}.quote`)}</p>
                <div className="testi-who">
                  <div className="testi-avatar">{item.initials}</div>
                  <div>
                    <div className="testi-name">{item.name}</div>
                    <div className="testi-role">{t(`testimonials.${item.key}.role`)}</div>
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
              {t('pricing.eyebrow')}
            </div>
            <h2>{t('pricing.title')}</h2>
            <p>{t('pricing.lead')}</p>
          </div>
          <div className="price-grid reveal">
            {PLANS.map((plan) => (
              <div
                className={`price-card${plan.featured ? ' featured' : ''}`}
                key={plan.key}
              >
                {plan.featured ? <div className="price-tag">{t('pricing.popular')}</div> : null}
                <div className="price-name">{t(`pricing.${plan.key}.name`)}</div>
                <div className="price-amt">
                  {plan.amount ?? t('pricing.enterprise.amount')}
                  {plan.amount ? <span>{t('pricing.perMonth')}</span> : null}
                </div>
                <p className="price-desc">{t(`pricing.${plan.key}.desc`)}</p>
                <ul className="price-list">
                  {PLAN_ITEMS.map((item) => (
                    <li key={item}>✓ {t(`pricing.${plan.key}.${item}`)}</li>
                  ))}
                </ul>
                <RouterLink
                  to={startTo}
                  className={`btn ${plan.featured ? 'btn-primary' : 'btn-ghost'}`}
                >
                  {t(`pricing.${plan.key}.cta`)}
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
              <h2>{t('cta.title')}</h2>
              <p>{t('cta.lead')}</p>
            </div>
            <div className="cta-actions">
              <RouterLink to={startTo} className="btn btn-primary">
                {t('hero.startTrial')}
              </RouterLink>
              <RouterLink to={loginTo} className="btn btn-ghost">
                {t('hero.bookDemo')}
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
              <p>{t('footer.tagline')}</p>
            </div>
            <div className="foot-col">
              <h4>{t('footer.product')}</h4>
              <a href="#features">{t('nav.features')}</a>
              <a href="#pricing">{t('nav.pricing')}</a>
              <a href="#how">{t('nav.how')}</a>
            </div>
            <div className="foot-col">
              <h4>{t('footer.company')}</h4>
              <a href="#contact">{t('footer.about')}</a>
              <a href="#contact">{t('footer.careers')}</a>
              <a href="#contact">{t('footer.contact')}</a>
            </div>
            <div className="foot-col">
              <h4>{t('footer.support')}</h4>
              <RouterLink to={loginTo}>{t('footer.help')}</RouterLink>
              <a href="#contact">{t('footer.status')}</a>
              <a href="#contact">{t('footer.privacy')}</a>
            </div>
          </div>
          <div className="foot-bottom">
            <p>{t('footer.rights')}</p>
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
