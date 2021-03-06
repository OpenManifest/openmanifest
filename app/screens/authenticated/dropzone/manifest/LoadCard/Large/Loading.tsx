import * as React from 'react';
import Skeleton from 'app/components/Skeleton';

export default function LoadingCard() {
  return (
    <Skeleton
      containerStyle={{
        height: 300,
        maxWidth: 535,
        paddingHorizontal: 16,
      }}
      isLoading
      layout={[{ key: 'header', width: '100%', height: '100%', borderRadius: 8 }]}
    />
  );
}
