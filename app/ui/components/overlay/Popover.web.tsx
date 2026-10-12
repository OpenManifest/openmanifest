import * as React from 'react';
import * as Primitive from '@rn-primitives/popover';
import { useTheme } from '../../theme';
import type { PopoverProps } from './Popover';

export type { PopoverProps } from './Popover';

type Controls = { open(): void; close(): void };

/** Calls a render-prop child with `close` (a component of its own, so the render of the popover never calls it) */
function Content({ close, children }: { close(): void; children: PopoverProps['children'] }) {
  return <>{typeof children === 'function' ? children(close) : children}</>;
}

/** On the web: Radix positions it next to the trigger, closes it on Escape or a click outside, returns focus */
export default function Popover({
  trigger,
  label,
  children,
  open,
  onOpenChange,
  align = 'start',
  flush = false,
  testID,
}: PopoverProps) {
  const theme = useTheme();
  // The primitive keeps its own open state: it is driven through the trigger, which exposes `open()` and `close()`
  const triggerRef = React.useRef<React.ComponentRef<typeof Primitive.Trigger>>(null);
  const close = () => (triggerRef.current as unknown as Controls | null)?.close();

  React.useEffect(() => {
    if (open === undefined) return;
    const node = triggerRef.current as unknown as Controls | null;
    if (open) node?.open();
    else node?.close();
  }, [open]);

  return (
    <Primitive.Root onOpenChange={onOpenChange}>
      <Primitive.Trigger asChild ref={triggerRef}>
        {trigger}
      </Primitive.Trigger>
      <Primitive.Portal>
        <Primitive.Content
          align={align}
          sideOffset={theme.space.xs}
          aria-label={label}
          testID={testID}
          style={{
            minWidth: 200,
            maxWidth: 360,
            padding: flush ? 0 : theme.space.lg,
            borderRadius: theme.radius.md,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: theme.colour.border,
            backgroundColor: theme.colour.surface,
            zIndex: 1002,
            ...theme.elevation.overlay,
          }}
        >
          <Content close={close}>{children}</Content>
        </Primitive.Content>
      </Primitive.Portal>
    </Primitive.Root>
  );
}
