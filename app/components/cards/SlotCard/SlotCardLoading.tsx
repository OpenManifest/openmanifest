import * as React from 'react';
import SkeletonContent from 'app/components/Skeleton';

export default function SlotSkeleton({ width }: { width: number }) {
  return (
    <SkeletonContent
      isLoading
      containerStyle={{
        height: 150,
        width,
        margin: 12,
      }}
      layout={[{ key: 'user-card-container', height: 150, width }]}
    />
  );
}
