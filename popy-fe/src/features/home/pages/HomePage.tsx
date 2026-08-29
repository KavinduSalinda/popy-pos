import { useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  Stack,
  ThemeProvider,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import PointOfSale from '@mui/icons-material/PointOfSale';
import Inventory2 from '@mui/icons-material/Inventory2';
import Warehouse from '@mui/icons-material/Warehouse';
import ShoppingCart from '@mui/icons-material/ShoppingCart';
import Storefront from '@mui/icons-material/Storefront';
import CloudOff from '@mui/icons-material/CloudOff';
import Assessment from '@mui/icons-material/Assessment';
import Groups from '@mui/icons-material/Groups';
import QrCodeScanner from '@mui/icons-material/QrCodeScanner';
import Payments from '@mui/icons-material/Payments';
import Sync from '@mui/icons-material/Sync';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants';
import { LOGO_SRC, POPY, POPY_ACCENTS, popyPublicTheme } from '../brand';

const NAV_LINKS = [
  { label: 'Product', href: '#product' },
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
];

const FEATURES = [
  {
    title: 'Point of Sale',
    body: 'Scan barcodes, build a cart, take cash, card, mobile or credit, and print a receipt.',
    icon: PointOfSale,
  },
  {
    title: 'Catalog',
    body: 'Products, categories, SKU and barcode, cost vs selling price, and reorder levels.',
    icon: Inventory2,
  },
  {
    title: 'Inventory',
    body: 'Live stock, adjustments, and low / out-of-stock alerts before the shelf runs empty.',
    icon: Warehouse,
  },
  {
    title: 'Purchasing',
    body: 'Suppliers, purchase orders, and goods receipt that put stock back on the books.',
    icon: ShoppingCart,
  },
  {
    title: 'Multi-shop',
    body: 'Each branch keeps its own catalog, sales, and stock. Switch shops without mixing data.',
    icon: Storefront,
  },
  {
    title: 'Offline till',
    body: 'Cache the catalog, take sales without internet, then sync when the line comes back.',
    icon: CloudOff,
  },
  {
    title: 'Reports',
    body: 'Today, this month, profit, trends, and top products — the same numbers the dashboard uses.',
    icon: Assessment,
  },
  {
    title: 'Roles that fit the floor',
    body: 'Super Admin, Manager, Cashier, and Inventory Officer each see only what they need.',
    icon: Groups,
  },
];

const STEPS = [
  {
    title: 'Scan',
    body: 'Barcode, search, or tap a product into the cart. Walk-in or named customer.',
    icon: QrCodeScanner,
  },
  {
    title: 'Pay',
    body: 'Cash with change, card, mobile, or credit. Optional receipt email or SMS.',
    icon: Payments,
  },
  {
    title: 'Stock updates',
    body: 'Quantity drops at checkout. Purchases and returns write the same audit trail.',
    icon: Sync,
  },
];

const ROLES = [
  { title: 'Super Admin', body: 'Shops, staff, settings, full operations.' },
  { title: 'Manager', body: 'Sales, stock, purchases, and reports — no system admin.' },
  { title: 'Cashier', body: 'POS, customers, and sales history at the counter.' },
  { title: 'Inventory Officer', body: 'Catalog, stock, GRN, and returns. No till.' },
];

const KPIS = [
  { label: "Today's sales", value: 'Rs. 48,260', hint: '28 Aug' },
  { label: 'Monthly sales', value: 'Rs. 1.12M', hint: 'August' },
  { label: 'Low stock', value: '17', hint: 'Reorder now' },
  { label: 'Out of stock', value: '2', hint: 'Cake slice, rice' },
];

const LogoMark = ({ height = 44 }: { height?: number }) => (
  <Box
    component="img"
    src={LOGO_SRC}
    alt="Popy"
    sx={{
      height,
      width: height,
      objectFit: 'cover',
      borderRadius: 1.5,
      display: 'block',
    }}
  />
);

const BrandLockup = ({ compact = false }: { compact?: boolean }) => (
  <Stack direction="row" alignItems="center" spacing={1.25}>
    <LogoMark height={compact ? 36 : 44} />
    <Box>
      <Typography
        sx={{
          fontWeight: 800,
          letterSpacing: '0.28em',
          fontSize: compact ? 14 : 16,
          lineHeight: 1.1,
          color: POPY.white,
        }}
      >
        POPY
      </Typography>
      {!compact && (
        <Typography
          sx={{
            fontSize: 9,
            letterSpacing: '0.22em',
            color: POPY.steel,
            mt: 0.25,
          }}
        >
          BUILT TO BE TRUSTED
        </Typography>
      )}
    </Box>
  </Stack>
);

const AccentBar = () => (
  <Box sx={{ display: 'flex', height: 4 }}>
    {POPY_ACCENTS.map((color) => (
      <Box key={color} sx={{ flex: 1, bgcolor: color }} />
    ))}
  </Box>
);

const HomeNav = () => {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const primaryTo = isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN;
  const primaryLabel = isAuthenticated ? 'Go to dashboard' : 'Sign in';

  const links = (
    <>
      {NAV_LINKS.map((link) => (
        <Button
          key={link.href}
          href={link.href}
          color="inherit"
          sx={{ color: POPY.steel, '&:hover': { color: POPY.white } }}
        >
          {link.label}
        </Button>
      ))}
    </>
  );

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'rgba(14, 25, 43, 0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <AccentBar />
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 72 }, gap: 2 }}>
          <Box
            component="a"
            href="#top"
            sx={{ display: 'flex', alignItems: 'center', mr: 'auto' }}
          >
            <BrandLockup />
          </Box>
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ display: { xs: 'none', md: 'flex' } }}
          >
            {links}
          </Stack>
          <Button
            component={RouterLink}
            to={primaryTo}
            variant="contained"
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            {primaryLabel}
          </Button>
          <IconButton
            onClick={() => setOpen(true)}
            sx={{ display: { md: 'none' }, color: POPY.white }}
            aria-label="Open menu"
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </Container>
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{ sx: { width: 280, bgcolor: POPY.navy, p: 2 } }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <BrandLockup compact />
          <IconButton onClick={() => setOpen(false)} sx={{ color: POPY.white }}>
            <CloseIcon />
          </IconButton>
        </Stack>
        <Stack spacing={1} onClick={() => setOpen(false)}>
          {NAV_LINKS.map((link) => (
            <Button key={link.href} href={link.href} sx={{ justifyContent: 'flex-start' }}>
              {link.label}
            </Button>
          ))}
          <Button component={RouterLink} to={primaryTo} variant="contained">
            {primaryLabel}
          </Button>
        </Stack>
      </Drawer>
    </AppBar>
  );
};

const HeroPreview = () => (
  <Box
    sx={{
      bgcolor: POPY.navyMid,
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 3,
      overflow: 'hidden',
      boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
    }}
  >
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{ px: 2, py: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}
    >
      {POPY_ACCENTS.map((color) => (
        <Box
          key={color}
          sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }}
        />
      ))}
      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
        Popy Super Market · MAIN
      </Typography>
    </Stack>
    <Box sx={{ p: 2 }}>
      <Typography variant="overline" sx={{ color: POPY.steel, letterSpacing: 1.6 }}>
        Dashboard
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr' },
          gap: 1.25,
          mt: 1,
        }}
      >
        {KPIS.map((kpi, i) => (
          <Box
            key={kpi.label}
            sx={{
              bgcolor: POPY.navy,
              borderRadius: 2,
              p: 1.5,
              borderLeft: '3px solid',
              borderColor: POPY_ACCENTS[i],
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {kpi.label}
            </Typography>
            <Typography fontWeight={800} sx={{ fontSize: { xs: 16, sm: 18 } }}>
              {kpi.value}
            </Typography>
            <Typography variant="caption" sx={{ color: POPY_ACCENTS[i] }}>
              {kpi.hint}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{ mt: 2, height: 72, display: 'flex', alignItems: 'flex-end', gap: 0.75, px: 0.5 }}>
        {[40, 55, 48, 62, 70, 58, 82].map((h, i) => (
          <Box
            key={i}
            sx={{
              flex: 1,
              height: `${h}%`,
              borderRadius: 1,
              bgcolor: i === 6 ? POPY.orange : POPY.teal,
              opacity: i === 6 ? 1 : 0.45,
            }}
          />
        ))}
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        Daily sales · last 7 days
      </Typography>
    </Box>
  </Box>
);

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const ctaTo = isAuthenticated ? ROUTES.POS : ROUTES.LOGIN;
  const ctaLabel = isAuthenticated ? 'Open POS' : 'Open the till';

  return (
    <ThemeProvider theme={popyPublicTheme}>
      <Box
        id="top"
        sx={{
          minHeight: '100vh',
          bgcolor: POPY.navy,
          color: POPY.white,
          overflowX: 'hidden',
        }}
      >
        <HomeNav />

        <Box
          component="section"
          sx={{
            position: 'relative',
            py: { xs: 7, md: 12 },
            background: `radial-gradient(ellipse at 80% 0%, rgba(254,126,35,0.12), transparent 50%),
              radial-gradient(ellipse at 10% 80%, rgba(48,185,167,0.10), transparent 45%)`,
          }}
        >
          <Container maxWidth="lg">
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1.05fr 0.95fr' },
                gap: { xs: 6, md: 8 },
                alignItems: 'center',
              }}
            >
              <Box>
                <Typography
                  sx={{
                    color: POPY.steel,
                    letterSpacing: '0.28em',
                    fontSize: 12,
                    fontWeight: 600,
                    mb: 2,
                  }}
                >
                  BUILT TO BE TRUSTED
                </Typography>
                <Typography
                  component="h1"
                  sx={{
                    fontSize: { xs: 36, sm: 48, md: 56 },
                    fontWeight: 800,
                    lineHeight: 1.08,
                    mb: 2,
                  }}
                >
                  Point of sale for shops that need the numbers to match the shelf.
                </Typography>
                <Typography
                  sx={{ color: POPY.steel, fontSize: { xs: 16, md: 18 }, maxWidth: 520, mb: 4 }}
                >
                  Popy POS runs the counter, the stockroom, and the daily report in one place —
                  barcode checkout, purchases, multi-shop, and offline till included.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <Button
                    component={RouterLink}
                    to={ctaTo}
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                  >
                    {ctaLabel}
                  </Button>
                  <Button href="#features" variant="outlined" size="large">
                    See what it does
                  </Button>
                </Stack>
              </Box>
              <HeroPreview />
            </Box>
          </Container>
        </Box>

        <Box
          id="product"
          sx={{ borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider', py: 3 }}
        >
          <Container maxWidth="lg">
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
                gap: 3,
              }}
            >
              {[
                { title: 'Multi-shop', body: 'Isolated branches, one login.' },
                { title: 'Barcode till', body: 'Scan, cart, receipt.' },
                { title: 'Stock alerts', body: 'Low and out, in time.' },
                { title: 'Offline POS', body: 'Sell, then sync.' },
              ].map((item, i) => (
                <Stack key={item.title} spacing={0.5}>
                  <Typography fontWeight={700} sx={{ color: POPY_ACCENTS[i] }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.body}
                  </Typography>
                </Stack>
              ))}
            </Box>
          </Container>
        </Box>

        <Box id="features" component="section" sx={{ py: { xs: 8, md: 12 } }}>
          <Container maxWidth="lg">
            <Typography variant="overline" sx={{ color: POPY.orange, letterSpacing: 2 }}>
              Features
            </Typography>
            <Typography variant="h2" sx={{ fontSize: { xs: 28, md: 40 }, mb: 1, maxWidth: 640 }}>
              Everything the floor and the back office share.
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 5, maxWidth: 560 }}>
              The same catalog the cashier scans is the stock the inventory officer receives.
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
                gap: 2,
              }}
            >
              {FEATURES.map((feature, i) => {
                const Icon = feature.icon;
                const color = POPY_ACCENTS[i % POPY_ACCENTS.length];
                return (
                  <Box
                    key={feature.title}
                    sx={{
                      p: 2.5,
                      bgcolor: POPY.navyMid,
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: 'divider',
                      height: '100%',
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: `${color}22`,
                        color,
                        display: 'grid',
                        placeItems: 'center',
                        mb: 1.5,
                      }}
                    >
                      <Icon fontSize="small" />
                    </Box>
                    <Typography fontWeight={700} mb={0.75}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.body}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Container>
        </Box>

        <Box id="how-it-works" component="section" sx={{ py: { xs: 8, md: 10 }, bgcolor: POPY.navyMid }}>
          <Container maxWidth="lg">
            <Typography variant="overline" sx={{ color: POPY.teal, letterSpacing: 2 }}>
              How it works
            </Typography>
            <Typography variant="h2" sx={{ fontSize: { xs: 28, md: 40 }, mb: 5 }}>
              Scan. Pay. Stock moves with the sale.
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                gap: 3,
              }}
            >
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <Stack key={step.title} spacing={1.5}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          bgcolor: POPY.navy,
                          color: POPY_ACCENTS[i],
                          display: 'grid',
                          placeItems: 'center',
                          border: '1px solid',
                          borderColor: POPY_ACCENTS[i],
                        }}
                      >
                        <Icon fontSize="small" />
                      </Box>
                      <Typography variant="h6">
                        {i + 1}. {step.title}
                      </Typography>
                    </Stack>
                    <Typography color="text.secondary">{step.body}</Typography>
                  </Stack>
                );
              })}
            </Box>
          </Container>
        </Box>

        <Box component="section" sx={{ py: { xs: 8, md: 12 } }}>
          <Container maxWidth="lg">
            <Typography variant="overline" sx={{ color: POPY.green, letterSpacing: 2 }}>
              Built for the whole shop
            </Typography>
            <Typography variant="h2" sx={{ fontSize: { xs: 28, md: 40 }, mb: 5 }}>
              Four roles. One system.
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
                gap: 2,
              }}
            >
              {ROLES.map((role, i) => (
                <Box
                  key={role.title}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    bgcolor: POPY.navyMid,
                    borderTop: '3px solid',
                    borderColor: POPY_ACCENTS[i],
                  }}
                >
                  <Typography fontWeight={700} mb={0.75}>
                    {role.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {role.body}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Container>
        </Box>

        <Box sx={{ px: { xs: 2, md: 0 }, pb: { xs: 8, md: 12 } }}>
          <Container maxWidth="lg">
            <Box
              sx={{
                borderRadius: 4,
                p: { xs: 4, md: 6 },
                background: `linear-gradient(135deg, ${POPY.navyLift} 0%, ${POPY.navy} 55%, ${POPY.navyMid} 100%)`,
                border: '1px solid',
                borderColor: 'divider',
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1.4fr auto' },
                gap: 3,
                alignItems: 'center',
              }}
            >
              <Box>
                <Typography variant="h2" sx={{ fontSize: { xs: 26, md: 36 }, mb: 1 }}>
                  Run the counter with confidence.
                </Typography>
                <Typography color="text.secondary">
                  Sign in to Popy POS — the till, the stock, and the day&apos;s numbers on one screen.
                </Typography>
              </Box>
              <Button
                component={RouterLink}
                to={ctaTo}
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                sx={{ justifySelf: { md: 'end' } }}
              >
                {ctaLabel}
              </Button>
            </Box>
          </Container>
        </Box>

        <Box
          component="footer"
          sx={{ borderTop: '1px solid', borderColor: 'divider', py: 4 }}
        >
          <Container maxWidth="lg">
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
            >
              <BrandLockup compact />
              <Typography variant="body2" color="text.secondary">
                Point of sale · inventory · purchasing · reports
              </Typography>
              <Button component={RouterLink} to={ROUTES.LOGIN} sx={{ color: POPY.steel }}>
                Sign in
              </Button>
            </Stack>
          </Container>
        </Box>
        <AccentBar />
      </Box>
    </ThemeProvider>
  );
};

export default HomePage;
