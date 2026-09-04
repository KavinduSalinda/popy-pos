import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type ParticlesProps = {
  id?: string;
  className?: string;
  background?: string;
  particleSize?: number;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  particleColor?: string;
  particleDensity?: number;
} & HTMLAttributes<HTMLDivElement>;

/**
 * Lightweight placeholder for the former tsparticles sparkles effect.
 * Kept as a typed export so marketing experiments can opt in without @ts-nocheck.
 */
export const SparklesCore = ({
  className,
  background = 'transparent',
  ...props
}: ParticlesProps) => (
  <div
    className={cn('pointer-events-none absolute inset-0', className)}
    style={{ background }}
    data-slot="sparkles-core"
    {...props}
  />
);
