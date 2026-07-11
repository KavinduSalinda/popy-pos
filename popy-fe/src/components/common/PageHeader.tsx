import type { ReactNode } from 'react';
import { Box, Breadcrumbs, Link, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

interface Crumb {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Crumb[];
  actions?: ReactNode;
}

export const PageHeader = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
}: PageHeaderProps) => (
  <Box sx={{ mb: 3 }}>
    {breadcrumbs && breadcrumbs.length > 0 && (
      <Breadcrumbs sx={{ mb: 1 }} aria-label="breadcrumb">
        {breadcrumbs.map((crumb) =>
          crumb.to ? (
            <Link
              key={crumb.label}
              component={RouterLink}
              to={crumb.to}
              underline="hover"
              color="inherit"
              variant="body2"
            >
              {crumb.label}
            </Link>
          ) : (
            <Typography key={crumb.label} variant="body2" color="text.primary">
              {crumb.label}
            </Typography>
          ),
        )}
      </Breadcrumbs>
    )}
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      gap={2}
    >
      <Box>
        <Typography variant="h5">{title}</Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && (
        <Stack direction="row" gap={1} flexWrap="wrap">
          {actions}
        </Stack>
      )}
    </Stack>
  </Box>
);
