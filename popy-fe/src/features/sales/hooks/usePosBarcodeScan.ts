import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAppDispatch } from '@/app/hooks';
import { getErrorMessage } from '@/utils';
import { useLazyLookupPosProductQuery } from '../salesApi';
import { addItem } from '../cartSlice';

export const usePosBarcodeScan = () => {
  const dispatch = useAppDispatch();
  const [lookupProduct] = useLazyLookupPosProductQuery();

  const handleScan = useCallback(
    async (rawCode: string): Promise<boolean> => {
      const code = rawCode.trim();
      if (!code) return false;

      try {
        const product = await lookupProduct({ code }).unwrap();

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
    [dispatch, lookupProduct],
  );

  return { handleScan };
};
