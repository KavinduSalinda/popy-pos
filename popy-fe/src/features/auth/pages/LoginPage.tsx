import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, Link, Stack } from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { FormTextField } from '@/components/forms';
import { useLoginMutation } from '../authApi';
import { loginSchema, type LoginFormValues } from '../schemas';
import { getErrorMessage } from '@/utils';
import { ROUTES } from '@/constants';

interface LocationState {
  from?: string;
}

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [login, { isLoading, error }] = useLoginMutation();

  const { control, handleSubmit } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values).unwrap();
      const state = location.state as LocationState | null;
      const from = state?.from;
      const next =
        from && from !== ROUTES.HOME && from !== ROUTES.LOGIN
          ? from
          : ROUTES.DASHBOARD;
      navigate(next, { replace: true });
    } catch {
      /* error surfaced via the `error` state */
    }
  });

  return (
    <Box component="form" onSubmit={onSubmit} noValidate>
      <Stack spacing={2}>
        {error && <Alert severity="error">{getErrorMessage(error)}</Alert>}
        <FormTextField
          name="email"
          control={control}
          label="Email"
          type="email"
          autoComplete="email"
          autoFocus
        />
        <FormTextField
          name="password"
          control={control}
          label="Password"
          type="password"
          autoComplete="current-password"
        />
        <Box sx={{ textAlign: 'right' }}>
          <Link
            component={RouterLink}
            to={ROUTES.FORGOT_PASSWORD}
            variant="body2"
            underline="hover"
          >
            Forgot password?
          </Link>
        </Box>
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isLoading}
        >
          {isLoading ? 'Signing in…' : 'Sign in'}
        </Button>
      </Stack>
    </Box>
  );
};

export default LoginPage;
