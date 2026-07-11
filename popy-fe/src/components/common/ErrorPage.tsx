import { Box, Button, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';

interface ErrorPageProps {
  code: string;
  title: string;
  description: string;
}

export const ErrorPage = ({ code, title, description }: ErrorPageProps) => {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        bgcolor: 'background.default',
      }}
    >
      <Stack spacing={2} alignItems="center" textAlign="center">
        <Typography
          variant="h1"
          sx={{ fontWeight: 800, fontSize: { xs: 80, md: 120 }, lineHeight: 1 }}
          color="primary"
        >
          {code}
        </Typography>
        <Typography variant="h5">{title}</Typography>
        <Typography variant="body1" color="text.secondary" maxWidth={420}>
          {description}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            Go back
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate(ROUTES.DASHBOARD)}
          >
            Go to dashboard
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export const NotFoundPage = () => (
  <ErrorPage
    code="404"
    title="Page not found"
    description="The page you are looking for doesn't exist or has been moved."
  />
);

export const ForbiddenPage = () => (
  <ErrorPage
    code="403"
    title="Access denied"
    description="You don't have permission to access this resource. Contact your administrator if you believe this is a mistake."
  />
);

export const ServerErrorPage = () => (
  <ErrorPage
    code="500"
    title="Internal server error"
    description="Something went wrong on our end. Please try again later."
  />
);
