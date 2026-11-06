import * as React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Card, DataTable, HelperText } from 'react-native-paper';
import UserAvatar from 'app/components/UserAvatar';
import { format, parseISO } from 'date-fns';
import { OperatorState, OperatorStateEvent } from 'app/api/schema.d';
import { OperatorStatisticsFragment } from 'app/api/operations';
import ChipSelect from 'app/components/input/chip_select/ChipSelect';
import Select from 'app/components/input/select/Select';
import { useOperatorsContext } from 'app/api/crud/useOperators';
import { useNotifications } from 'app/providers/notifications';

interface IOperatorsTableProps {
  operators: OperatorStatisticsFragment[];
  selected: OperatorStatisticsFragment[];
  onChangeSelected(operators: OperatorStatisticsFragment[]): void;
}

const stateEvent = {
  [OperatorState.Archived]: OperatorStateEvent.Archive,
  [OperatorState.InReview]: OperatorStateEvent.RequestPublication,
  [OperatorState.Private]: OperatorStateEvent.Unpublish,
  [OperatorState.Public]: OperatorStateEvent.Publish,
};

function OperatorTableRow(props: { operator?: OperatorStatisticsFragment | null }) {
  const { operator } = props;

  const { updateVisibility } = useOperatorsContext();
  const notify = useNotifications();

  const onChangeVisibility = React.useCallback(
    async (state: OperatorState) => {
      if (!operator?.id) {
        return;
      }
      const result = await updateVisibility(operator.id, stateEvent[state]);

      if ('error' in result && result.error) {
        notify.error(result.error);
      }
    },
    [notify, operator?.id, updateVisibility]
  );

  if (!operator) {
    return null;
  }
  return (
    <DataTable.Row
      style={{
        borderLeftColor: operator.primaryColor || undefined,
        borderLeftWidth: 5,
      }}
    >
      <DataTable.Cell style={styles.avatarCell}>
        <UserAvatar size={20} name={operator?.name} image={operator.banner} />
      </DataTable.Cell>
      <DataTable.Cell style={styles.nameCell}>{operator.name}</DataTable.Cell>
      <DataTable.Cell style={styles.createdCell}>
        <HelperText type="info">{format(parseISO(operator.createdAt), 'dd MMM, HH:mm')}</HelperText>
      </DataTable.Cell>
      <DataTable.Cell style={styles.statusCell}>
        <Select<OperatorState>
          value={operator.status}
          options={[
            { label: 'Archived', value: OperatorState.Archived },
            { label: 'Private', value: OperatorState.Private },
            { label: 'In Review', value: OperatorState.InReview },
            { label: 'Public', value: OperatorState.Public },
          ]}
          onChange={onChangeVisibility}
        />
      </DataTable.Cell>
      <DataTable.Cell style={styles.loadsCell}>
        {operator?.statistics?.loadsCount || 0}
      </DataTable.Cell>
      <DataTable.Cell style={styles.usersCell}>
        {operator?.statistics?.activeUserCount || 0}
      </DataTable.Cell>
    </DataTable.Row>
  );
}
export default function OperatorsTable(props: IOperatorsTableProps) {
  const { operators, onChangeSelected, selected } = props;

  return (
    <Card style={{ flexGrow: 1, width: '100%' }}>
      <Card.Title title="Dropzones" />
      <Card.Content style={{ width: '100%' }}>
        <ChipSelect
          allowEmpty
          items={operators}
          onChange={onChangeSelected}
          value={selected}
          renderItemLabel={(value) => value.name}
        />
        <ScrollView
          horizontal
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          style={{ width: '100%', height: '100%', flexGrow: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <DataTable>
            <DataTable.Header>
              <DataTable.Title style={styles.avatarCell}>{null}</DataTable.Title>
              <DataTable.Title style={styles.nameCell}>Name</DataTable.Title>
              <DataTable.Title style={styles.createdCell}>Created</DataTable.Title>
              <DataTable.Title style={styles.statusCell}>Status</DataTable.Title>
              <DataTable.Title style={styles.loadsCell}>Loads</DataTable.Title>
              <DataTable.Title style={styles.usersCell}>Active Users</DataTable.Title>
            </DataTable.Header>
            {/* Rows in place: the overview screen is the vertical scroll container */}
            {operators.map((item) =>
              !item ? null : <OperatorTableRow key={`operator-row-${item?.id}`} operator={item} />
            )}
          </DataTable>
        </ScrollView>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  avatarCell: {
    flex: 5,
  },
  statusCell: {
    flex: 20,
  },
  nameCell: {
    flex: 40,
  },
  loadsCell: {
    flex: 5,
  },
  usersCell: {
    flex: 5,
  },
  createdCell: {
    flex: 10,
  },
});
