import React from 'react';
import { cn } from '../../lib/utils';

const BrandLogo = ({ className, imageClassName, labelClassName, stacked = false, showText = true }) => {
  return (
    <div className={cn('flex items-center gap-3', stacked && 'flex-col items-start gap-2', className)}>
      <img
        src="/worknest-logo.jpg"
        alt="WorkNest logo"
        className={cn('h-11 w-auto rounded-2xl object-contain', imageClassName)}
      />
      {showText ? (
        <div className={cn(stacked ? 'space-y-1' : 'space-y-0.5', labelClassName)}>
          <p className="text-xl font-bold text-slate-900">WorkNest</p>
          <p className="text-sm text-slate-500">Run your freelance workspace with clarity</p>
        </div>
      ) : null}
    </div>
  );
};

export default BrandLogo;
