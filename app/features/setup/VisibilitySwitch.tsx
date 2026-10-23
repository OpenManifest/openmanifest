import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { OperatorState, OperatorStateEvent } from 'app/api/schema.d';
import { useOperatorsContext } from 'app/api/crud/useOperators';
import { useNotifications } from 'app/providers/notifications';
import { useOperatorContext } from 'app/providers/operator/context';
import { Switch, useTheme } from 'app/ui';

/** Which way the switch goes from a state: what turning it on and off asks for */
export function visibilityEvent(state: OperatorState, on: boolean): OperatorStateEvent {
  if (!on) return OperatorStateEvent.Unpublish;
  return state === OperatorState.Archived
    ? OperatorStateEvent.Publish
    : OperatorStateEvent.RequestPublication;
}

/**
 * Whether the public can find the operator: on once it is public or waiting for a moderator's review (which cannot be
 * cancelled from here), off while it is private or archived.
 */
export default function VisibilitySwitch() {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const notify = useNotifications();
  const {
    operator: { operator },
  } = useOperatorContext();
  const { updateVisibility } = useOperatorsContext();
  const [busy, setBusy] = React.useState(false);
  const state = operator?.status ?? OperatorState.Private;

  const onChange = async (on: boolean) => {
    if (!operator?.id) return;
    setBusy(true);
    try {
      const result = await updateVisibility(operator.id, visibilityEvent(state, on));
      if ('error' in result && result.error) notify.error(result.error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ paddingHorizontal: theme.space.lg }}>
      <Switch
        testID="setup-visibility"
        label={t(`setupMenu.visibility.${state}.label`)}
        helperText={t(`setupMenu.visibility.${state}.help`)}
        value={state === OperatorState.Public || state === OperatorState.InReview}
        disabled={busy || state === OperatorState.InReview}
        onChange={onChange}
      />
    </View>
  );
}
