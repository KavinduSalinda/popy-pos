import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { baseApi } from '@/api/baseApi';
import { setCurrentShopId } from '@/features/auth/authSlice';
import type { ID } from '@/types';

export const ShopSwitcher = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const currentShopId = useAppSelector((s) => s.auth.currentShopId);
  const shops = user?.shops ?? [];

  if (shops.length <= 1) {
    const single = shops[0];
    if (!single) return null;
    return (
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel id="shop-label">Shop</InputLabel>
        <Select
          labelId="shop-label"
          label="Shop"
          value={String(single.id)}
          disabled
        >
          <MenuItem value={String(single.id)}>{single.name}</MenuItem>
        </Select>
      </FormControl>
    );
  }

  const handleChange = (event: SelectChangeEvent) => {
    const shopId = event.target.value as ID;
    dispatch(setCurrentShopId(shopId));
    dispatch(baseApi.util.resetApiState());
  };

  return (
    <FormControl size="small" sx={{ minWidth: 180 }}>
      <InputLabel id="shop-label">Shop</InputLabel>
      <Select
        labelId="shop-label"
        label="Shop"
        value={currentShopId ? String(currentShopId) : ''}
        onChange={handleChange}
      >
        {shops.map((shop) => (
          <MenuItem key={String(shop.id)} value={String(shop.id)}>
            {shop.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
