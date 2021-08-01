import * as React from 'react';
import Skeleton from 'react-native-skeleton-content';

export default function LoadingCard() {
  return (
    <Skeleton
      containerStyle={{
        height: 160,
        width: 335,
        margin: 16,
      }}
      isLoading
      layout={[{ key: 'header', width: '100%', height: '100%', borderRadius: 8 }]}
    />
  );
}
