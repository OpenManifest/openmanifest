import * as React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import { Row } from '../components/Stack';
import Overlay from '../components/overlay/Overlay';
import type { Presentation } from '../components/overlay/presentation';
import type { Breakpoint } from 'app/components/layout/useBreakpoint';
import { useTheme } from '../theme';

export type ResourceFormProps = {
  open: boolean;
  /** Called when the person closes it: the close button, the backdrop, Escape, the back gesture */
  onClose(): void;
  /** Names the form for screen readers and heads it ("New vehicle", "Edit Otter") */
  title: string;
  /** Saves; without it there is no save button (an item that is only looked at, or archived) */
  onSubmit?(): void;
  /** The save button's label (default "Save") */
  submitLabel?: string;
  /** Saving or archiving is under way: the buttons wait */
  loading?: boolean;
  /** Archives (or removes) the item being edited; leave it out for a new one or when the person may not */
  onArchive?(): void;
  /** The archive button's label (default "Archive") */
  archiveLabel?: string;
  testID?: string;
  children?: React.ReactNode;
};

/**
 * Where the form of a setup item opens: a sheet on a phone, a side panel on a wide window, a dialog in between (design plan
 * §4, overlays).
 */
export function resourceFormPresentation(breakpoint: Breakpoint): Presentation {
  return breakpoint === 'compact' ? 'sheet' : 'auto';
}

/**
 * The form of one item of a setup list (a vehicle, a ticket, a crew role): the fields scroll, the buttons stay pinned
 * below them, Save at the end and Archive, when the item can be archived, at the start.
 */
export default function ResourceForm({
  open,
  onClose,
  title,
  onSubmit,
  submitLabel,
  loading = false,
  onArchive,
  archiveLabel,
  testID = 'form-dialog',
  children,
}: ResourceFormProps) {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const save = onSubmit ? (
    <Button
      label={submitLabel ?? t('forms.save')}
      fullWidth={!onArchive}
      loading={loading}
      onPress={onSubmit}
      testID="resource-form-save"
    />
  ) : null;

  return (
    <Overlay
      open={open}
      onClose={onClose}
      title={title}
      presentation={resourceFormPresentation(theme.breakpoint)}
      testID={testID}
      footer={
        onArchive ? (
          <Row gap="sm" justify="between" align="center" wrap>
            <Button
              label={archiveLabel ?? t('resources.archive')}
              icon="archive-outline"
              variant="tertiary"
              disabled={loading}
              onPress={onArchive}
              testID="resource-form-archive"
            />
            {save}
          </Row>
        ) : (
          (save ?? undefined)
        )
      }
    >
      {children}
    </Overlay>
  );
}
