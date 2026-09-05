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
  { value: 'pcs', label: 'pcs' },
  { value: 'kg', label: 'kg / g' },
  { value: 'litre', label: 'litre / ml' },
  { value: 'box', label: 'box' },
  { value: 'pack', label: 'pack' },
  { value: 'dozen', label: 'dozen' },
];

/** Map legacy split units onto the combined weight / volume choices. */
export const normalizeProductUnit = (unit: string): string => {
  const normalized = unit.trim().toLowerCase();
  if (normalized === 'g' || normalized === 'gram' || normalized === 'grams') {
    return 'kg';
  }
  if (
    normalized === 'ml' ||
    normalized === 'millilitre' ||
    normalized === 'milliliter' ||
    normalized === 'l' ||
    normalized === 'liter' ||
    normalized === 'liters' ||
    normalized === 'litres'
  ) {
    return 'litre';
  }
  return normalized || unit;
};

const FRACTIONAL_UNITS = new Set(['kg', 'litre', 'g', 'ml', 'gram', 'grams']);

/** Weight / volume units can be sold in fractions (1.5 kg, 0.25 litre). */
export const allowsFractionalQuantity = (unit?: string | null): boolean => {
  if (!unit) return false;
  return FRACTIONAL_UNITS.has(normalizeProductUnit(unit));
};

export const quantityStepForUnit = (unit?: string | null): number =>
  allowsFractionalQuantity(unit) ? 0.1 : 1;

export const minQuantityForUnit = (unit?: string | null): number =>
  allowsFractionalQuantity(unit) ? 0.001 : 1;

export const roundQuantity = (quantity: number, unit?: string | null): number => {
  if (!Number.isFinite(quantity)) return minQuantityForUnit(unit);
  if (allowsFractionalQuantity(unit)) {
    return Math.round(quantity * 1000) / 1000;
  }
  return Math.round(quantity);
};

export const clampQuantity = (
  quantity: number,
  maxStock: number,
  unit?: string | null,
): number => {
  const min = minQuantityForUnit(unit);
  const max = Math.max(min, maxStock);
  return roundQuantity(Math.max(min, Math.min(quantity, max)), unit);
};

export const formatQuantityLabel = (quantity: number, unit?: string | null): string => {
  if (allowsFractionalQuantity(unit)) {
    return Number(quantity.toFixed(3)).toString();
  }
  return String(Math.round(quantity));
};
