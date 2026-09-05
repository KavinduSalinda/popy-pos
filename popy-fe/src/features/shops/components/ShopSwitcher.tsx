import { FormControl, InputLabel, MenuItem, Select, Stack, Typography } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { baseApi } from '@/api/baseApi';
import { setCurrentShopId, updateUser } from '@/features/auth/authSlice';
import type { ID } from '@/types';
import { useGetAccessibleShopsQuery } from '../shopsApi';

export const ShopSwitcher = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const currentShopId = useAppSelector((s) => s.auth.currentShopId);
  const { data } = useGetAccessibleShopsQuery(undefined, {
    skip: !user,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (!user || !data?.shops?.length) return;
    const prevById = new Map(
      (user.shops ?? []).map((shop) => [String(shop.id), shop] as const),
    );
    const unchanged =
      prevById.size === data.shops.length &&
      data.shops.every((shop) => {
        const prev = prevById.get(String(shop.id));
        return prev && prev.plan === shop.plan && prev.name === shop.name;
      });
    if (unchanged) return;
    dispatch(
      updateUser({
        ...user,
        shops: data.shops,
        defaultShopId: data.defaultShopId ?? user.defaultShopId,
      }),
    );
  }, [data, dispatch, user]);

  const shops = data?.shops ?? user?.shops ?? [];

  if (shops.length === 0) return null;

  if (shops.length === 1) {
    const single = shops[0];
    return (
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel id="shop-label">Shop</InputLabel>
        <Select
          labelId="shop-label"
          label="Shop"
          value={String(single.id)}
          disabled
        >
          <MenuItem value={String(single.id)}>
            {single.name}
            {single.plan === 'PRO' ? ' · Pro' : ''}
          </MenuItem>
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
            <Stack direction="row" spacing={1} alignItems="center">
              <span>{shop.name}</span>
              {shop.plan === 'PRO' ? (
                <Typography variant="caption" color="warning.main" fontWeight={700}>
                  Pro
                </Typography>
              ) : null}
            </Stack>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
