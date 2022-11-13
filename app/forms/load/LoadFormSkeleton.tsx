import * as React from 'react';
import SkeletonContent from 'app/components/Skeleton';

export default function LoadFormSkeleton() {
  return (
    <SkeletonContent
      containerStyle={{
        height: 120,
        width: 335,
        margin: 16,
        paddingHorizontal: 16,
      }}
      isLoading
      layout={[{ key: 'header', width: '100%', height: 60, borderRadius: 8, marginBottom: 8 }]}
    />
  );
}
