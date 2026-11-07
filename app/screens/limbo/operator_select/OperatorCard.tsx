import * as React from 'react';
import { StackActions, useNavigation } from '@react-navigation/native';
import { OperatorEssentialsFragment } from 'app/api/operations';
import { Avatar, Icon, ListRow, Row, type IconName } from 'app/ui';
import { useSession } from '../../../state';
import useSelectOperator from '../../../hooks/useSelectOperator';

interface OperatorCardProps {
  operator: OperatorEssentialsFragment;
}

/** An operator to choose: its banner (or initials), name and the icon and name of its template (a parachute for a dropzone);
 * choosing it joins it when needed and opens it */
export default function OperatorCard(props: OperatorCardProps) {
  const { operator } = props;
  const currentOperatorId = useSession((session) => session.currentOperatorId);
  const selectOperator = useSelectOperator();
  const navigation = useNavigation();
  const name = operator?.name ?? '';

  const onPress = React.useCallback(async () => {
    if (!operator) return;
    const shouldPushRoute = !!currentOperatorId;
    const selected = await selectOperator(operator);

    if (selected && shouldPushRoute) {
      navigation.dispatch(
        StackActions.replace('Authenticated', {
          screen: 'Manifest',
          params: { screen: 'ManifestScreen' },
        })
      );
    }
  }, [currentOperatorId, navigation, operator, selectOperator]);

  return (
    <ListRow
      testID={`operator-${operator?.id}`}
      title={name}
      leading={<Avatar name={name} imageUri={operator?.banner} />}
      supporting={operator?.template?.name}
      trailing={
        <Row gap="sm" align="center">
          {operator?.template?.icon ? (
            <Icon name={operator.template.icon as IconName} tone="muted" />
          ) : null}
          <Icon name="chevron-right" />
        </Row>
      }
      selected={!!currentOperatorId && String(currentOperatorId) === String(operator?.id)}
      onPress={onPress}
    />
  );
}
