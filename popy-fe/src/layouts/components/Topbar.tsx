import { useState, type MouseEvent } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LightMode from '@mui/icons-material/LightMode';
import DarkMode from '@mui/icons-material/DarkMode';
import Logout from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  toggleMobileSidebar,
  toggleSidebar,
  toggleThemeMode,
} from '@/app/uiSlice';
import { useAuth } from '@/hooks/useAuth';
import { useLogoutMutation } from '@/features/auth/authApi';
import { ShopSwitcher } from '@/features/shops/components/ShopSwitcher';
import { ROLE_LABELS } from '@/constants/roles';
import { ROUTES } from '@/constants';

export const Topbar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const themeMode = useAppSelector((state) => state.ui.themeMode);
  const { user } = useAuth();
  const [logout] = useLogoutMutation();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleMenuToggle = () => {
    dispatch(isDesktop ? toggleSidebar() : toggleMobileSidebar());
  };

  const handleLogout = async () => {
    setAnchorEl(null);
    await logout()
      .unwrap()
      .catch(() => undefined);
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{
        zIndex: (t) => t.zIndex.drawer + 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ gap: 1 }}>
        <IconButton
          edge="start"
          aria-label="toggle navigation"
          onClick={handleMenuToggle}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1 }} />

        <ShopSwitcher />

        <Tooltip title="Toggle theme">
          <IconButton
            aria-label="toggle theme"
            onClick={() => dispatch(toggleThemeMode())}
          >
            {themeMode === 'dark' ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Account">
          <IconButton
            aria-label="account menu"
            onClick={(e: MouseEvent<HTMLElement>) =>
              setAnchorEl(e.currentTarget)
            }
          >
            <Avatar
              src={user?.avatarUrl}
              sx={{ width: 34, height: 34, bgcolor: 'primary.main' }}
            >
              {initials}
            </Avatar>
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2">{user?.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {user ? ROLE_LABELS[user.role] : ''}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};
