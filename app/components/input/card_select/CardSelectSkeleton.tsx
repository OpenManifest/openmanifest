import * as React from 'react';
import SkeletonContent from 'app/components/Skeleton';

interface IChipSelectSkeletonLoadingProps {
  rows?: number;
}
export default function ChipSelectSkeleton(props: IChipSelectSkeletonLoadingProps) {
  const { rows } = props;
  return (
    <SkeletonContent
      isLoading
      containerStyle={{
        height: 15 + 13 + 13 + (rows || 1) * 32,
        width: '100%',
        justifyContent: 'center',
        marginBottom: 16,
      }}
      layout={[
        {
          key: 'header',
          width: 70,
          height: 15,
          borderRadius: 8,
          marginVertical: 13,
          marginHorizontal: 8,
        },
        {
          key: 'chips',
          flexDirection: 'row',
          children: [
            {
              key: 'chip1',
              width: 96,
              height: 32,
              borderRadius: 16,
              marginRight: 4,
            },
            {
              key: 'chip2',
              width: 96,
              height: 32,
              borderRadius: 16,
              marginRight: 4,
            },
            { key: 'chip3', width: 96, height: 32, borderRadius: 16 },
          ],
        },
      ]}
    />
  );
}
