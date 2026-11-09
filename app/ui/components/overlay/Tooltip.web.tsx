import * as React from 'react';
import * as Primitive from '@rn-primitives/tooltip';
import { useTheme } from '../../theme';
import Text from '../Text';
import type { TooltipProps } from './Tooltip';

export type { TooltipProps } from './Tooltip';

/** On the web: shows on hover and on keyboard focus (not only hover), `role="tooltip"`, Escape hides it */
export default function Tooltip({ label, children }: TooltipProps) {
  const theme = useTheme();

  return (
    <Primitive.Root>
      <Primitive.Trigger asChild>{children}</Primitive.Trigger>
      <Primitive.Portal>
        <Primitive.Content
          sideOffset={theme.space.xs}
          style={{
            paddingHorizontal: theme.space.md,
            paddingVertical: theme.space.xs,
            borderRadius: theme.radius.sm,
            backgroundColor: theme.colour.text,
            zIndex: 1003,
          }}
        >
          <Text variant="caption" tone="inverse">
            {label}
          </Text>
        </Primitive.Content>
      </Primitive.Portal>
    </Primitive.Root>
  );
}
