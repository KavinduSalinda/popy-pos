import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, Link, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { FormTextField } from '@/components/forms';
import { useForgotPasswordMutation } from '../authApi';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '../schemas';
import { getErrorMessage } from '@/utils';
import { ROUTES } from '@/constants';

export const ForgotPasswordPage = () => {
  const [forgotPassword, { isLoading, isSuccess, error }] =
    useForgotPasswordMutation();

  const { control, handleSubmit } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    await forgotPassword(values)
      .unwrap()
      .catch(() => undefined);
  });

  return (
    <Box component="form" onSubmit={onSubmit} noValidate>
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          Enter your email and we'll send you a link to reset your password.
        </Typography>
        {isSuccess && (
          <Alert severity="success">
            If an account exists for that email, a reset link is on its way.
          </Alert>
        )}
        {error && <Alert severity="error">{getErrorMessage(error)}</Alert>}
        <FormTextField
          name="email"
          control={control}
          label="Email"
          type="email"
          autoComplete="email"
          autoFocus
        />
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isLoading}
        >
          {isLoading ? 'Sending…' : 'Send reset link'}
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

export default ForgotPasswordPage;
