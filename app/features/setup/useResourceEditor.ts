import * as React from 'react';
import { useIsFocused } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useNotifications } from 'app/providers/notifications';

/** What an archive answers: the item, or why not */
type ArchiveResponse = { error?: string | null } | object;

export type ResourceEditor<T> = {
  /** The form is open: `original` is the item edited, none for a new one */
  editing: { original: T | null } | null;
  openNew(): void;
  openItem(item: T): void;
  close(): void;
  /** Archives the item edited and closes the form; undefined for a new item or when archiving is not allowed */
  onArchive?(): void;
};

/**
 * Which item of a setup list has its form open, and archiving it from the form: on success the form closes and a toast
 * names the item, on failure the toast says why and the form stays.
 */
export function useResourceEditor<T>({
  archive,
  nameOf,
}: {
  /** Leave it out when the item cannot be archived, or the person may not */
  archive?: (item: T) => Promise<ArchiveResponse>;
  nameOf(item: T): string;
}): ResourceEditor<T> {
  const { t } = useTranslation('common');
  const notify = useNotifications();
  const [editing, setEditing] = React.useState<{ original: T | null } | null>(null);
  const original = editing?.original ?? null;

  const onArchive = React.useCallback(async () => {
    if (!original || !archive) return;
    const response = await archive(original);
    if ('error' in response && response.error) {
      notify.error(response.error);
    } else {
      notify.success(t('resources.archived', { name: nameOf(original) }));
      setEditing(null);
    }
  }, [archive, nameOf, notify, original, t]);

  return {
    editing,
    openNew: () => setEditing({ original: null }),
    openItem: (item: T) => setEditing({ original: item }),
    close: () => setEditing(null),
    onArchive: original && archive ? onArchive : undefined,
  };
}

/** Asks again whenever the screen comes back into view (another screen or device may have changed the list) */
export function useRefetchOnFocus(refetch: () => unknown, skip = false) {
  const isFocused = useIsFocused();
  React.useEffect(() => {
    if (isFocused && !skip) refetch();
  }, [isFocused, refetch, skip]);
}
