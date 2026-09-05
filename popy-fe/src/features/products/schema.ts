import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  sku: z.string().min(1, 'SKU is required').max(60),
  barcode: z.string().max(60).optional().or(z.literal('')),
  categoryId: z.union([z.string(), z.number()]).refine((v) => v !== '', {
    message: 'Category is required',
  }),
  brand: z.string().max(80).optional().or(z.literal('')),
  unit: z.string().min(1, 'Unit is required').max(20),
  costPrice: z.number().min(0, 'Must be 0 or more'),
  sellingPrice: z.number().min(0, 'Must be 0 or more'),
  reorderLevel: z.number().int().min(0, 'Must be 0 or more'),
  status: z.boolean(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export const PRODUCT_UNITS = [
  'pcs',
  'kg',
  'g',
  'litre',
  'ml',
  'box',
  'pack',
  'dozen',
].map((u) => ({ value: u, label: u }));

const FRACTIONAL_UNITS = new Set(['kg', 'g', 'litre', 'liter', 'l', 'ml']);

export const normalizeProductUnit = (unit: string): string =>
  unit.trim().toLowerCase();

/** Infer sell-by unit. Name wins when it clearly indicates weight/volume
 * (e.g. unit is "pack" but name is "Chicken Whole 1kg"). */
export const resolveSellUnit = (product: {
  unit?: string | null;
  name?: string | null;
}): string | undefined => {
  const name = (product.name ?? '').toLowerCase();
  // Note: "1kg" has no word boundary before "kg", so do not use \bkg\b
  if (/(?:^|[^a-z])kg(?:$|[^a-z])/.test(name) || name.includes('kilogram')) {
    return 'kg';
  }
  if (/\b(litres?|liters?)\b/.test(name)) return 'litre';
  if (/(?:^|[^a-z])\d+([.,]\d+)?\s*l(?:$|[^a-z])/.test(name)) return 'litre';
  if (product.unit?.trim()) {
    return normalizeProductUnit(product.unit);
  }
  return undefined;
};

/** Weight / volume units that can be sold in fractional amounts. */
export const allowsFractionalQuantity = (unit?: string | null): boolean => {
  if (!unit) return false;
  return FRACTIONAL_UNITS.has(normalizeProductUnit(unit));
};

export const quantityStepForUnit = (unit?: string | null): number => {
  if (!unit) return 1;
  const normalized = normalizeProductUnit(unit);
  if (
    normalized === 'kg' ||
    normalized === 'litre' ||
    normalized === 'liter' ||
    normalized === 'l'
  ) {
    return 1;
  }
  if (normalized === 'g' || normalized === 'ml') {
    return 1;
  }
  return 1;
};

/** Clamp POS qty to stock; keep up to 3 decimals for fractional units. */
export const clampQuantity = (
  quantity: number,
  maxStock: number,
  unit?: string | null,
): number => {
  const fractional = allowsFractionalQuantity(unit);
  const min = fractional ? 0.001 : 1;
  const max = Math.max(min, Number(maxStock) || min);
  let next = Number(quantity);
  if (!Number.isFinite(next)) next = min;
  next = Math.max(min, Math.min(next, max));
  if (fractional) return Math.round(next * 1000) / 1000;
  return Math.round(next);
};
