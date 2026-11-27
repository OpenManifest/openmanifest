import * as React from 'react';
import Skeleton from 'app/components/Skeleton';

export default function LoadingCard() {
  return (
    <Skeleton
      key="loading-card"
      containerStyle={{
        height: 160,
        width: 335,
        margin: 16,
      }}
      isLoading
      layout={[{ key: 'header', width: 335, height: 160, borderRadius: 8 }]}
    />
  );
}
