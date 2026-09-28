import React from 'react';

export function SkeletonLoader({ className = 'h-4 w-full', borderRadius = 'rounded-md' }) {
  return (
    <div className={`animate-pulse bg-slate-200 dark:bg-slate-800 ${borderRadius} ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <SkeletonLoader className="w-10 h-10 rounded-xl shrink-0" />
        <div className="space-y-2 flex-1">
          <SkeletonLoader className="h-4 w-3/4" />
          <SkeletonLoader className="h-3 w-1/2" />
        </div>
      </div>
      <SkeletonLoader className="h-3 w-full" />
      <SkeletonLoader className="h-3 w-5/6" />
      <div className="flex items-center justify-between pt-2">
        <SkeletonLoader className="h-7 w-24 rounded-lg" />
        <SkeletonLoader className="h-7 w-32 rounded-lg" />
      </div>
    </div>
  );
}
