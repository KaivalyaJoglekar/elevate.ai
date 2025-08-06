// src/components/AnalysisSkeleton.tsx

import React from 'react';
import AnimatedPage from './AnimatedPage';

// A reusable helper component for creating the pulsing placeholder boxes.
const SkeletonBox = ({ className }: { className?: string }) => (
  <div className={`bg-gray-200 dark:bg-neutral-800 rounded-lg animate-pulse ${className}`} />
);

const AnalysisSkeleton: React.FC = () => {
  return (
    <AnimatedPage>
        <div className="space-y-16">
        
        {/* Header Skeleton */}
        <div className="flex justify-end">
            <SkeletonBox className="h-10 w-48" />
        </div>

        {/* Hero Section Skeleton */}
        <div className="flex flex-col items-center space-y-3">
            <SkeletonBox className="h-12 w-3/4 max-w-lg" />
            <SkeletonBox className="h-5 w-full max-w-2xl" />
            <SkeletonBox className="h-5 w-5/6 max-w-xl" />
        </div>
        
        {/* Toggler Skeleton */}
        <div className="flex justify-center">
            <SkeletonBox className="h-12 w-full max-w-sm rounded-lg" />
        </div>

        {/* Main Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-8">
                <SkeletonBox className="h-56 w-full rounded-2xl" />
                <SkeletonBox className="h-48 w-full rounded-2xl" />
                <SkeletonBox className="h-48 w-full rounded-2xl" />
            </div>
            {/* Sidebar Column */}
            <div className="space-y-8">
                <SkeletonBox className="h-64 w-full rounded-2xl" />
                <SkeletonBox className="h-40 w-full rounded-2xl" />
                <SkeletonBox className="h-40 w-full rounded-2xl" />
            </div>
        </div>

        {/* Deep Dive Section Skeleton */}
        <div className="space-y-8">
            <div className="flex justify-center">
                <SkeletonBox className="h-10 w-1/2 max-w-lg" />
            </div>
             <SkeletonBox className="h-96 w-full rounded-2xl" />
        </div>

        {/* Recommended Opportunities Skeleton */}
        <div className="space-y-12">
            <div className="flex justify-center">
                <SkeletonBox className="h-10 w-1/2 max-w-lg" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonBox key={i} className="h-56 rounded-2xl" />
                ))}
            </div>
        </div>

      </div>
    </AnimatedPage>
  );
};

export default AnalysisSkeleton;