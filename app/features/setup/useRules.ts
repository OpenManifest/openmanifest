import * as React from 'react';
import { isEqual } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useIndustriesQuery } from 'app/api/reflection';
import { useOperatorContext } from 'app/providers/operator/context';
import { useNotifications } from 'app/providers/notifications';
import { moduleSwitches, rulesInput, rulesOf, type ModuleSwitch, type RulesValues } from './rules';

/**
 * The rules page's state: the operator's values, the person's changes, and saving them in one `updateOperator`. The
 * values follow the operator until the person changes something; after a save they are the saved ones.
 */
export default function useRules() {
  const { t } = useTranslation('common');
  const notify = useNotifications();
  const {
    operator: { operator, update },
  } = useOperatorContext();
  const industries = useIndustriesQuery();
  const template = industries.data?.industries.find(
    (industry) => industry.slug === operator?.industry
  );

  const switches: ModuleSwitch[] = React.useMemo(
    () =>
      moduleSwitches(template?.modules ?? [], (operator?.modules ?? {}) as Record<string, unknown>),
    [template?.modules, operator?.modules]
  );
  const initial = React.useMemo(
    () => (operator ? rulesOf(operator, switches) : null),
    [operator, switches]
  );
  const [edited, setEdited] = React.useState<RulesValues | null>(null);
  const [saving, setSaving] = React.useState(false);
  const values = edited ?? initial;
  const dirty = !!edited && !!initial && !isEqual(edited, initial);

  const change = React.useCallback(
    (next: (current: RulesValues) => RulesValues) => {
      setEdited((current) => {
        const base = current ?? initial;
        return base ? next(base) : current;
      });
    },
    [initial]
  );

  const save = React.useCallback(async () => {
    if (!operator || !initial || !values) return;
    setSaving(true);
    try {
      const response = await update(rulesInput(operator, initial, values));
      if ('operator' in response && response.operator) {
        setEdited(null);
        notify.success(t('rules.saved'));
      } else {
        notify.error(('error' in response && response.error) || t('rules.saveFailed'));
      }
    } finally {
      setSaving(false);
    }
  }, [operator, initial, values, update, notify, t]);

  return {
    operator,
    values,
    switches,
    modulesLoading: industries.loading,
    dirty,
    saving,
    change,
    save,
    discard: () => setEdited(null),
  };
}
