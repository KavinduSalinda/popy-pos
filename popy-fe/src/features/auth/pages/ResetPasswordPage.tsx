import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, Link, Stack } from '@mui/material';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FormTextField } from '@/components/forms';
import { useResetPasswordMutation } from '../authApi';
import { resetPasswordSchema, type ResetPasswordFormValues } from '../schemas';
import { getErrorMessage } from '@/utils';
import { ROUTES } from '@/constants';

export const ResetPasswordPage = () => {
  const { token = '' } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [resetPassword, { isLoading, error }] = useResetPasswordMutation();

  const { control, handleSubmit } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await resetPassword({ token, password: values.password }).unwrap();
      toast.success('Password reset successfully. Please sign in.');
      navigate(ROUTES.LOGIN, { replace: true });
    } catch {
      /* error surfaced via the `error` state */
    }
  });

  return (
    <Box component="form" onSubmit={onSubmit} noValidate>
      <Stack spacing={2}>
        {error && <Alert severity="error">{getErrorMessage(error)}</Alert>}
        <FormTextField
          name="password"
          control={control}
          label="New password"
          type="password"
          autoComplete="new-password"
          autoFocus
        />
        <FormTextField
          name="confirmPassword"
          control={control}
          label="Confirm password"
          type="password"
          autoComplete="new-password"
        />
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isLoading}
        >
          {isLoading ? 'Resetting…' : 'Reset password'}
        </Button>
        <Box sx={{ textAlign: 'center' }}>
          <Link
            component={RouterLink}
            to={ROUTES.LOGIN}
            variant="body2"
            underline="hover"
          >
            Back to sign in
          </Link>
        </Box>
      </Stack>
    </Box>
  );
};

export default ResetPasswordPage;
