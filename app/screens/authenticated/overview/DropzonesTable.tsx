import * as React from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { Card, DataTable, HelperText } from 'react-native-paper';
import UserAvatar from 'app/components/UserAvatar';
import { format, parseISO } from 'date-fns';
import { DropzoneStatisticsFragment } from 'app/api/operations';
import ChipSelect from 'app/components/input/chip_select/ChipSelect';

interface IDropzonesTableProps {
  dropzones: DropzoneStatisticsFragment[];
  selected: DropzoneStatisticsFragment[];
  onChangeSelected(dropzones: DropzoneStatisticsFragment[]): void;
}

function DropzoneTableRow(props: { dropzone?: DropzoneStatisticsFragment | null }) {
  const { dropzone } = props;

  if (!dropzone) {
    return null;
  }

  return (
    <DataTable.Row
      style={{
        borderLeftColor: dropzone.primaryColor || undefined,
        borderLeftWidth: 5,
      }}
    >
      <DataTable.Cell style={styles.avatarCell}>
        <UserAvatar size={20} name={dropzone?.name} image={dropzone.banner} />
      </DataTable.Cell>
      <DataTable.Cell style={styles.nameCell}>{dropzone.name}</DataTable.Cell>
      <DataTable.Cell style={styles.createdCell}>
        <HelperText type="info">{format(parseISO(dropzone.createdAt), 'dd MMM, HH:mm')}</HelperText>
      </DataTable.Cell>
      <DataTable.Cell style={styles.statusCell}>
        {dropzone?.requestPublication && !dropzone?.isPublic ? 'Review' : null}
        {dropzone?.isPublic ? 'Active' : null}
        {!dropzone?.requestPublication && !dropzone?.isPublic ? 'Inactive' : null}
      </DataTable.Cell>
      <DataTable.Cell style={styles.loadsCell}>
        {dropzone?.statistics?.loadsCount || 0}
      </DataTable.Cell>
      <DataTable.Cell style={styles.usersCell}>
        {dropzone?.statistics?.activeUserCount || 0}
      </DataTable.Cell>
    </DataTable.Row>
  );
}
export default function DropzonesTable(props: IDropzonesTableProps) {
  const { dropzones, onChangeSelected, selected } = props;

  return (
    <Card style={{ flexGrow: 1 }}>
      <Card.Title title="Dropzones" />
      <Card.Content>
        <ChipSelect
          allowEmpty
          items={dropzones}
          onChangeSelected={onChangeSelected}
          selected={selected}
          renderItemLabel={(value) => value.name}
        />
        <DataTable>
          <DataTable.Header>
            <DataTable.Title style={styles.avatarCell}>{null}</DataTable.Title>
            <DataTable.Title style={styles.nameCell}>Name</DataTable.Title>
            <DataTable.Title style={styles.createdCell}>Created</DataTable.Title>
            <DataTable.Title style={styles.statusCell}>Status</DataTable.Title>
            <DataTable.Title style={styles.loadsCell}>Loads</DataTable.Title>
            <DataTable.Title style={styles.usersCell}>Active Users</DataTable.Title>
          </DataTable.Header>
          <FlatList
            data={dropzones}
            renderItem={({ item }) =>
              !item ? null : <DropzoneTableRow key={`dropzone-row=${item?.id}`} dropzone={item} />
            }
          />
        </DataTable>
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
