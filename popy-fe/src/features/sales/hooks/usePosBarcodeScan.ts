import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { getErrorMessage } from '@/utils';
import { lookupCachedProduct } from '@/offline/catalogCache';
import { useOnlineStatus } from '@/offline/hooks/useOnlineStatus';
import { useLazyLookupPosProductQuery } from '../salesApi';
import { addItem } from '../cartSlice';

export const usePosBarcodeScan = () => {
  const dispatch = useAppDispatch();
  const shopId = useAppSelector((state) => state.auth.currentShopId);
  const { isOffline } = useOnlineStatus();
  const [lookupProduct] = useLazyLookupPosProductQuery();

  const handleScan = useCallback(
    async (rawCode: string): Promise<boolean> => {
      const code = rawCode.trim();
      if (!code) return false;

      try {
        const product = isOffline
          ? shopId
            ? await lookupCachedProduct(shopId, code)
            : null
          : await lookupProduct({ code }).unwrap();

        if (!product) {
          toast.error(`Product not found: ${code}`);
          return false;
        }

        if (product.stockQuantity <= 0) {
          toast.error(`${product.name} is out of stock`);
          return false;
        }

        dispatch(addItem(product));
        toast.success(`Added ${product.name}`);
        return true;
      } catch (error) {
        toast.error(getErrorMessage(error) || `Product not found: ${code}`);
        return false;
      }
    },
    [dispatch, isOffline, lookupProduct, shopId],
  );

  return { handleScan };
};
