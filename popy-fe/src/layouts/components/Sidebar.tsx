import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { NavLink } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setMobileSidebarOpen } from '@/app/uiSlice';
import { usePermissions } from '@/hooks/usePermissions';
import { NAV_ITEMS } from '@/app/routes/navigation';
import { APP_CONFIG } from '@/constants';
import { LOGO_SRC } from '@/features/home/brand';

export const SIDEBAR_WIDTH = 256;
export const SIDEBAR_COLLAPSED_WIDTH = 72;

const Brand = ({ collapsed }: { collapsed: boolean }) => (
  <Toolbar sx={{ gap: 1.5, px: 2 }}>
    <Box
      component="img"
      src={LOGO_SRC}
      alt=""
      sx={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 1, flexShrink: 0 }}
    />
    {!collapsed && (
      <Typography variant="h6" noWrap fontWeight={800}>
        {APP_CONFIG.name}
      </Typography>
    )}
  </Toolbar>
);

const NavList = ({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) => {
  const { hasPermission } = usePermissions();
  const items = NAV_ITEMS.filter((item) => hasPermission(item.permission));

  return (
    <List sx={{ px: 1 }}>
      {items.map(({ label, path, icon: Icon }) => (
        <Tooltip
          key={path}
          title={collapsed ? label : ''}
          placement="right"
          arrow
        >
          <ListItemButton
            component={NavLink}
            to={path}
            onClick={onNavigate}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              justifyContent: collapsed ? 'center' : 'flex-start',
              '&.active': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '& .MuiListItemIcon-root': { color: 'inherit' },
                '&:hover': { bgcolor: 'primary.dark' },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 0, mr: collapsed ? 0 : 2 }}>
              <Icon fontSize="small" />
            </ListItemIcon>
            {!collapsed && <ListItemText primary={label} />}
          </ListItemButton>
        </Tooltip>
      ))}
    </List>
  );
};

export const Sidebar = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { sidebarOpen, mobileSidebarOpen } = useAppSelector(
    (state) => state.ui,
  );

  const collapsed = isDesktop && !sidebarOpen;
  const width = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  if (isDesktop) {
    return (
      <Drawer
        variant="permanent"
        sx={{
          width,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          '& .MuiDrawer-paper': {
            width,
            boxSizing: 'border-box',
            overflowX: 'hidden',
            transition: theme.transitions.create('width'),
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <Brand collapsed={collapsed} />
        <Box sx={{ overflow: 'auto', overflowX: 'hidden' }}>
          <NavList collapsed={collapsed} />
        </Box>
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="temporary"
      open={mobileSidebarOpen}
      onClose={() => dispatch(setMobileSidebarOpen(false))}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH } }}
    >
      <Brand collapsed={false} />
      <NavList
        collapsed={false}
        onNavigate={() => dispatch(setMobileSidebarOpen(false))}
      />
    </Drawer>
  );
};
