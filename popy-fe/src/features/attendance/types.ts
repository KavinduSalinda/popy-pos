export type ClockType = 'in' | 'out';
export type ShopPlan = 'FREE' | 'PRO';

export interface AttendanceRecord {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  userRole: string;
  shopId: number;
  shopName: string;
  attendanceDate: string;
  clockInAt: string | null;
  clockOutAt: string | null;
  clockedIn: boolean;
  clockedOut: boolean;
  createdAt: string;
  updatedAt: string;
  alreadyMarked?: boolean;
  action?: ClockType;
}

export interface AttendanceTodayResponse {
  attendanceDate: string;
  clockedIn: boolean;
  clockedOut: boolean;
  marked: boolean;
  record: AttendanceRecord | null;
}
