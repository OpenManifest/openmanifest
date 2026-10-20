import * as React from 'react';
import { Row, Skeleton, Stack } from 'app/ui';

interface IChipSelectSkeletonLoadingProps {
  rows?: number;
}

/** What a list of chips looks like while it loads: a caption and `rows` rows of three chips */
export default function ChipSelectSkeleton({ rows = 1 }: IChipSelectSkeletonLoadingProps) {
  return (
    <Stack gap="sm">
      <Skeleton width={70} height={15} />
      {Array.from({ length: rows }, (_, row) => (
        <Row key={row} gap="sm">
          <Skeleton width={96} height={32} />
          <Skeleton width={96} height={32} />
          <Skeleton width={96} height={32} />
        </Row>
      ))}
    </Stack>
  );
}
