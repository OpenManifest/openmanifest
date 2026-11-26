import * as React from 'react';
import { Skeleton } from 'app/ui';

/** What the new load form looks like while its choices load */
export default function LoadFormSkeleton() {
  return <Skeleton height={60} />;
}
