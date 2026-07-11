import { useState, type ReactNode } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { toast } from 'react-toastify';
import { useAppSelector } from '@/app/hooks';
import { PageHeader } from '@/components/common';
import { useAuth } from '@/hooks';
import { getErrorMessage } from '@/utils';
import {
  useGetNotificationSettingsQuery,
  useUpdateNotificationSettingsMutation,
} from '../settingsApi';
import type { NotificationSettings } from '../types';

interface ScenarioRowProps {
  title: string;
  description: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  onEmailChange: (value: boolean) => void;
  onSmsChange: (value: boolean) => void;
  extra?: ReactNode;
}

const ScenarioRow = ({
  title,
  description,
  emailEnabled,
  smsEnabled,
  onEmailChange,
  onSmsChange,
  extra,
}: ScenarioRowProps) => (
  <Box>
    <Typography variant="subtitle1" fontWeight={600}>
      {title}
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
      {description}
    </Typography>
    <Stack direction={{ xs: 'column', sm: 'row' }} gap={2} flexWrap="wrap">
      <FormControlLabel
        control={
          <Switch
            checked={emailEnabled}
            onChange={(event) => onEmailChange(event.target.checked)}
          />
        }
        label="Email"
      />
      <FormControlLabel
        control={
          <Switch
            checked={smsEnabled}
            onChange={(event) => onSmsChange(event.target.checked)}
          />
        }
        label="SMS"
      />
    </Stack>
    {extra}
  </Box>
);

const defaultSettings: NotificationSettings = {
  id: 1,
  posCheckoutEmailEnabled: true,
  posCheckoutSmsEnabled: false,
  posCheckoutCashierEmailEnabled: true,
  posCheckoutCashierSmsEnabled: false,
  lowInventoryEmailEnabled: true,
  lowInventorySmsEnabled: false,
  lowInventoryAlertPhone: '',
  newCustomerEmailEnabled: true,
  newCustomerSmsEnabled: false,
  newUserEmailEnabled: true,
  newUserSmsEnabled: false,
  updatedAt: '',
};

interface NotificationSettingsFormProps {
  initialSettings: NotificationSettings;
  shopName?: string;
}

const NotificationSettingsForm = ({
  initialSettings,
  shopName,
}: NotificationSettingsFormProps) => {
  const [form, setForm] = useState(initialSettings);
  const [updateSettings, { isLoading: saving }] =
    useUpdateNotificationSettingsMutation();

  const handleSave = async () => {
    try {
      await updateSettings({
        posCheckoutEmailEnabled: form.posCheckoutEmailEnabled,
        posCheckoutSmsEnabled: form.posCheckoutSmsEnabled,
        posCheckoutCashierEmailEnabled: form.posCheckoutCashierEmailEnabled,
        posCheckoutCashierSmsEnabled: form.posCheckoutCashierSmsEnabled,
        lowInventoryEmailEnabled: form.lowInventoryEmailEnabled,
        lowInventorySmsEnabled: form.lowInventorySmsEnabled,
        lowInventoryAlertPhone: form.lowInventoryAlertPhone,
        newCustomerEmailEnabled: form.newCustomerEmailEnabled,
        newCustomerSmsEnabled: form.newCustomerSmsEnabled,
        newUserEmailEnabled: form.newUserEmailEnabled,
        newUserSmsEnabled: form.newUserSmsEnabled,
      }).unwrap();
      toast.success('Notification settings saved');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle={
          shopName
            ? `Configure email and SMS notifications for ${shopName}.`
            : 'Configure email (Brevo) and SMS (Text.lk) notifications for each scenario.'
        }
        actions={
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        }
      />

      <Card>
        <CardContent>
          <Stack spacing={3} divider={<Divider flexItem />}>
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                POS checkout
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enable receipt notifications at checkout. Cashiers with
                permission can choose to send email or SMS for each sale.
              </Typography>
              <Stack spacing={2}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  gap={2}
                  flexWrap="wrap"
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.posCheckoutEmailEnabled}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            posCheckoutEmailEnabled: event.target.checked,
                          }))
                        }
                      />
                    }
                    label="Email enabled"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.posCheckoutSmsEnabled}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            posCheckoutSmsEnabled: event.target.checked,
                          }))
                        }
                      />
                    }
                    label="SMS enabled"
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Cashier permissions at checkout
                </Typography>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  gap={2}
                  flexWrap="wrap"
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.posCheckoutCashierEmailEnabled}
                        disabled={!form.posCheckoutEmailEnabled}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            posCheckoutCashierEmailEnabled:
                              event.target.checked,
                          }))
                        }
                      />
                    }
                    label="Allow cashiers to send email"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.posCheckoutCashierSmsEnabled}
                        disabled={!form.posCheckoutSmsEnabled}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            posCheckoutCashierSmsEnabled: event.target.checked,
                          }))
                        }
                      />
                    }
                    label="Allow cashiers to send SMS"
                  />
                </Stack>
              </Stack>
            </Box>

            <ScenarioRow
              title="Low inventory"
              description="Alert staff when product stock drops to the reorder level."
              emailEnabled={form.lowInventoryEmailEnabled}
              smsEnabled={form.lowInventorySmsEnabled}
              onEmailChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  lowInventoryEmailEnabled: value,
                }))
              }
              onSmsChange={(value) =>
                setForm((prev) => ({ ...prev, lowInventorySmsEnabled: value }))
              }
              extra={
                form.lowInventorySmsEnabled ? (
                  <TextField
                    label="SMS alert phone"
                    helperText="Phone number for low-stock SMS alerts (e.g. 94771234567)"
                    value={form.lowInventoryAlertPhone}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        lowInventoryAlertPhone: event.target.value,
                      }))
                    }
                    size="small"
                    sx={{ mt: 2, maxWidth: 360 }}
                  />
                ) : null
              }
            />

            <ScenarioRow
              title="New customer account"
              description="Welcome message when a new customer is created."
              emailEnabled={form.newCustomerEmailEnabled}
              smsEnabled={form.newCustomerSmsEnabled}
              onEmailChange={(value) =>
                setForm((prev) => ({ ...prev, newCustomerEmailEnabled: value }))
              }
              onSmsChange={(value) =>
                setForm((prev) => ({ ...prev, newCustomerSmsEnabled: value }))
              }
            />

            <ScenarioRow
              title="New user account"
              description="Notify staff when a new user account is created."
              emailEnabled={form.newUserEmailEnabled}
              smsEnabled={form.newUserSmsEnabled}
              onEmailChange={(value) =>
                setForm((prev) => ({ ...prev, newUserEmailEnabled: value }))
              }
              onSmsChange={(value) =>
                setForm((prev) => ({ ...prev, newUserSmsEnabled: value }))
              }
            />
          </Stack>
        </CardContent>
      </Card>
    </>
  );
};

export const SettingsPage = () => {
  const { data, isLoading } = useGetNotificationSettingsQuery();
  const { user } = useAuth();
  const currentShopId = useAppSelector((state) => state.auth.currentShopId);
  const shopName = user?.shops?.find(
    (shop) => String(shop.id) === String(currentShopId),
  )?.name;

  if (isLoading || !data) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <NotificationSettingsForm
      key={data.updatedAt}
      initialSettings={data ?? defaultSettings}
      shopName={shopName}
    />
  );
};

export default SettingsPage;
