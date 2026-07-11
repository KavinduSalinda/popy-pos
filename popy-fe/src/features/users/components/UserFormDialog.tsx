import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Grid } from '@mui/material';
import { toast } from 'react-toastify';
import { Modal } from '@/components/dialogs';
import { FormSelect, FormSwitch, FormTextField } from '@/components/forms';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/utils';
import { getRoleOptionsForActor, ROLES, type Role } from '@/constants/roles';
import { useCreateUserMutation, useUpdateUserMutation } from '../usersApi';
import { userSchema, type UserFormValues } from '../schema';
import type { ManagedUser, UserPayload } from '../types';

interface UserFormDialogProps {
  open: boolean;
  user: ManagedUser | null;
  onClose: () => void;
}

const EMPTY: UserFormValues = {
  name: '',
  email: '',
  role: ROLES.CASHIER,
  isActive: true,
  password: '',
};

export const UserFormDialog = ({
  open,
  user,
  onClose,
}: UserFormDialogProps) => {
  const [createUser, { isLoading: creating }] = useCreateUserMutation();
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation();
  const { user: currentUser } = useAuth();
  const isEdit = Boolean(user);
  const roleOptions = useMemo(
    () => getRoleOptionsForActor(currentUser?.role),
    [currentUser?.role],
  );

  const { control, handleSubmit, reset } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (open) {
      reset(
        user
          ? {
              name: user.name,
              email: user.email,
              role: user.role,
              isActive: user.isActive,
              password: '',
            }
          : EMPTY,
      );
    }
  }, [open, user, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const payload: UserPayload = {
      name: values.name,
      email: values.email,
      role: values.role as Role,
      isActive: values.isActive,
      password: values.password || undefined,
    };
    try {
      if (user) {
        await updateUser({ id: user.id, data: payload }).unwrap();
        toast.success('User updated');
      } else {
        await createUser(payload).unwrap();
        toast.success('User created');
      }
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit user' : 'New user'}
      actions={
        <>
          <Button color="inherit" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={onSubmit}
            disabled={creating || updating}
          >
            {isEdit ? 'Save changes' : 'Create'}
          </Button>
        </>
      }
    >
      <Grid container spacing={2} component="form" onSubmit={onSubmit} mt={0}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField name="name" control={control} label="Name" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField
            name="email"
            control={control}
            label="Email"
            type="email"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormSelect
            name="role"
            control={control}
            label="Role"
            options={roleOptions}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField
            name="password"
            control={control}
            label={isEdit ? 'New password (optional)' : 'Password'}
            type="password"
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FormSwitch name="isActive" control={control} label="Active" />
        </Grid>
      </Grid>
    </Modal>
  );
};
