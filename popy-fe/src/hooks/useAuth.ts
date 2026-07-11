import { useAppSelector } from '@/app/hooks';
import {
  selectCurrentUser,
  selectIsAuthenticated,
} from '@/features/auth/authSelectors';

export const useAuth = () => {
  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  return { user, isAuthenticated };
};
