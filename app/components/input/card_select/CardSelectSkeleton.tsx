import * as React from 'react';
import { Skeleton, Stack } from 'app/ui';

interface ICardSelectSkeletonLoadingProps {
  rows?: number;
}

/** What a list of cards looks like while it loads: `rows` cards (three by default) */
export default function CardSelectSkeleton({ rows = 3 }: ICardSelectSkeletonLoadingProps) {
  return (
    <Stack gap="sm">
      {Array.from({ length: rows }, (_, row) => (
        <Skeleton key={row} height={56} />
      ))}
    </Stack>
  );
}
