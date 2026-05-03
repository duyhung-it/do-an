/**
 * ChartWrapper - Isolates Recharts components to minimize console warnings
 * 
 * Recharts v2.x has known internal key collision issues in its SVG rendering.
 * This wrapper applies isolation and memoization strategies to reduce (but not eliminate)
 * these warnings, which originate from library internals beyond application control.
 */

import { memo, type ReactNode } from 'react';

interface ChartWrapperProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wraps Recharts components with memoization to prevent unnecessary re-renders
 * that can trigger duplicate key warnings from Recharts internals.
 */
export const ChartWrapper = memo(function ChartWrapper({ 
  children, 
  className 
}: ChartWrapperProps) {
  return (
    <div className={className} suppressHydrationWarning>
      {children}
    </div>
  );
});
