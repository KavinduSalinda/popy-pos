export interface NotificationSettings {
  id: number;
  posCheckoutEmailEnabled: boolean;
  posCheckoutSmsEnabled: boolean;
  posCheckoutCashierEmailEnabled: boolean;
  posCheckoutCashierSmsEnabled: boolean;
  lowInventoryEmailEnabled: boolean;
  lowInventorySmsEnabled: boolean;
  lowInventoryAlertPhone: string;
  newCustomerEmailEnabled: boolean;
  newCustomerSmsEnabled: boolean;
  newUserEmailEnabled: boolean;
  newUserSmsEnabled: boolean;
  updatedAt: string;
  /** Present on GET; Pro-only feature gate. */
  isProFeature?: boolean;
  proEnabled?: boolean;
}

export type NotificationSettingsPayload = Omit<
  NotificationSettings,
  'id' | 'updatedAt'
>;

export interface PosCheckoutNotificationOptions {
  emailEnabled: boolean;
  smsEnabled: boolean;
  cashierEmailEnabled: boolean;
  cashierSmsEnabled: boolean;
  canSendEmail: boolean;
  canSendSms: boolean;
  proEnabled?: boolean;
}
