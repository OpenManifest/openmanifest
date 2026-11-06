import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Button,
  IconButton,
  Menu,
  NumberField,
  Overlay,
  Row,
  Segmented,
  Text,
  useTheme,
} from 'app/ui';
import type { MenuItem } from 'app/ui';
import type { CrewRoleEssentialsFragment, LoadDetailsFragment } from 'app/api/operations';
import { formatCall } from 'app/i18n/format';
import { needsConfirmation, type LoadActionKey } from './loadActions';
import { useLoadActions } from './useLoadActions';

const ICON: Record<LoadActionKey, MenuItem['icon']> = {
  call: 'bullhorn-outline',
  depart: 'airplane-takeoff',
  complete: 'airplane-landing',
  cancelCall: 'bullhorn-variant-outline',
  cancelLoad: 'cancel',
  reopen: 'undo',
};

const CUSTOM = 'custom';
const DEFAULT_CUSTOM_MINUTES = 15;
const MAX_CUSTOM_MINUTES = 180;

export type LoadActionsProps = {
  load: LoadDetailsFragment;
  crewRoles?: readonly CrewRoleEssentialsFragment[];
  testID?: string;
};

/**
 * The next action of a load as one button, chosen by its state, and the rest in a menu: call (from the operator's
 * schedule, or a time of your own), cancel the call, depart, land, cancel the load, re-open it. Cancelling a load and
 * landing one that never departed ask first; a failure is shown as a toast.
 */
export default function LoadActions({
  load,
  crewRoles = [],
  testID = 'load-actions',
}: LoadActionsProps) {
  const { t } = useTranslation(['common', 'terms']);
  const theme = useTheme();
  const { plan, callMinutes, busy, run, blocked } = useLoadActions(load, crewRoles);
  const [picking, setPicking] = React.useState(false);
  const [custom, setCustom] = React.useState<number | null>(DEFAULT_CUSTOM_MINUTES);
  const [choice, setChoice] = React.useState<string | null>(null);
  const [confirming, setConfirming] = React.useState<LoadActionKey | null>(null);
  const loadTerm = String(t('terms:load', { count: 1 })).toLowerCase();
  const callTerm = String(t('terms:call', { count: 1 }));

  const label = (action: LoadActionKey) =>
    t(`common:board.actions.${action}`, { call: callTerm.toLowerCase(), load: loadTerm });

  const press = (action: LoadActionKey) => {
    if (action === 'call') {
      setChoice(null);
      setPicking(true);
    } else if (needsConfirmation(action, load.state)) {
      setConfirming(action);
    } else {
      run(action);
    }
  };

  if (!plan.primary && !plan.menu.length) return null;

  const options = [
    ...callMinutes.map((minutes) => ({ value: String(minutes), label: formatCall(minutes) })),
    { value: CUSTOM, label: t('common:board.actions.custom') },
  ];
  const call = async (minutes: number) => {
    setPicking(false);
    await run('call', minutes);
  };

  return (
    <Row gap="sm" align="center" testID={testID}>
      {plan.primary ? (
        <View style={{ flex: 1 }}>
          <Button
            testID={`${testID}-primary`}
            label={label(plan.primary)}
            icon={ICON[plan.primary]}
            loading={busy}
            disabled={!!blocked(plan.primary)}
            fullWidth
            onPress={() => press(plan.primary as LoadActionKey)}
          />
          {blocked(plan.primary) ? (
            <Text variant="caption" tone="warning" testID={`${testID}-blocked`}>
              {blocked(plan.primary)}
            </Text>
          ) : null}
        </View>
      ) : null}
      {plan.menu.length ? (
        <Menu
          label={t('common:board.actions.more')}
          trigger={
            <IconButton
              icon="dots-vertical"
              aria-label={t('common:board.actions.more')}
              testID={`${testID}-menu`}
            />
          }
          items={plan.menu.map((action) => ({
            label: label(action),
            icon: ICON[action],
            destructive: action === 'cancelLoad',
            disabled: !!blocked(action),
            testID: `${testID}-${action}`,
            onPress: () => press(action),
          }))}
        />
      ) : null}

      <Overlay
        open={picking}
        onClose={() => setPicking(false)}
        title={label('call')}
        presentation="dialog"
        testID={`${testID}-call`}
        footer={
          choice === CUSTOM ? (
            <Button
              label={label('call')}
              testID={`${testID}-call-custom`}
              disabled={!custom}
              onPress={() => custom && call(custom)}
            />
          ) : undefined
        }
      >
        <View style={{ gap: theme.space.md }}>
          <Segmented
            label={t('common:board.actions.callIn', { call: callTerm.toLowerCase() })}
            testID={`${testID}-schedule`}
            options={options}
            value={choice}
            onChange={(value) => {
              setChoice(value);
              if (value !== CUSTOM) call(Number(value));
            }}
          />
          {choice === CUSTOM ? (
            <NumberField
              label={t('common:board.actions.minutes')}
              testID={`${testID}-minutes`}
              value={custom}
              onChange={setCustom}
              min={1}
              max={MAX_CUSTOM_MINUTES}
              unit={t('common:board.actions.minutesUnit')}
            />
          ) : null}
        </View>
      </Overlay>

      <Overlay
        open={!!confirming}
        onClose={() => setConfirming(null)}
        title={confirming ? label(confirming) : ''}
        presentation="dialog"
        testID={`${testID}-confirm`}
        footer={
          <Row gap="sm" justify="end">
            <Button
              variant="secondary"
              label={t('common:board.actions.keep')}
              onPress={() => setConfirming(null)}
            />
            <Button
              variant="destructive"
              testID={`${testID}-confirm-yes`}
              label={confirming ? label(confirming) : ''}
              onPress={() => {
                const action = confirming;
                setConfirming(null);
                if (action) run(action);
              }}
            />
          </Row>
        }
      >
        <Text>
          {confirming
            ? t(`common:board.actions.confirm.${confirming}`, {
                load: loadTerm,
                number: load.loadNumber,
              })
            : ''}
        </Text>
      </Overlay>
    </Row>
  );
}
