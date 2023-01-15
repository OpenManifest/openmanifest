import * as React from 'react';
import { Button, Card, DataTable, IconButton, List, Paragraph } from 'react-native-paper';
import { Linking, View } from 'react-native';
import { useNavigation } from '@react-navigation/core';
import { Screen } from 'app/components/layout';
import DatePicker from 'app/components/input/date_picker/DatePicker';
import { useDropzoneContext } from 'app/providers/dropzone/context';
import { useMasterLogQuery } from 'app/api/reflection';
import { MasterLogQueryVariables } from 'app/api/operations';
import { DateTime } from 'luxon';
import { FormTextField } from 'app/components/input/text/TextField';
import { DropzoneUserSelectField } from 'app/components/input/dropdown_select';
import { Permission } from 'app/api/schema.d';
import usePalette from 'app/hooks/usePalette';
import NoResults from 'app/components/NoResults';
import useMasterLogForm from './useForm';

export default function DropzoneMasterLogScreen() {
  const { dropzone: currentDropzone } = useDropzoneContext();
  const [date, setDate] = React.useState(DateTime.local().toISODate());
  const navigation = useNavigation();
  const [isEditing, setIsEditing] = React.useState(false);
  const toggleEditing = React.useCallback(() => setIsEditing(!isEditing), [isEditing]);
  const theme = usePalette();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <DatePicker
          validRange={{ endDate: new Date() }}
          onChange={(time) => setDate(DateTime.fromSeconds(time).toISODate())}
          value={DateTime.fromISO(date).toSeconds()}
          color={theme.text}
        />
      ),
    });
  }, [date, navigation, theme.text]);

  const variables: MasterLogQueryVariables = React.useMemo(
    () => ({
      dropzoneId: currentDropzone?.dropzone?.id?.toString() as string,
      date,
    }),
    [currentDropzone?.dropzone?.id, date]
  );

  const { data } = useMasterLogQuery({ variables, skip: !currentDropzone?.dropzone?.id });
  const entry = React.useMemo(() => data?.masterLog, [data?.masterLog]);

  const onDownload = React.useCallback(() => {
    if (data?.masterLog?.downloadUrl) {
      Linking.openURL(data?.masterLog?.downloadUrl);
    }
  }, [data?.masterLog?.downloadUrl]);

  const { control, onSubmit, isDirty } = useMasterLogForm({
    initial: {
      date,
      notes: entry?.notes,
      dzso: entry?.dzso,
    },
    onSuccess: () => setIsEditing(false),
  });

  return (
    <Screen scrollable fullWidth={false}>
      <View style={{ width: '100%', paddingTop: 48 }}>
        <Card>
          <Card.Title
            right={() => (
              <IconButton icon="download" onPress={onDownload} style={{ marginRight: 8 }} />
            )}
            title={`${DateTime.fromISO(date).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)}`}
          />
          <Card.Content>
            {isEditing ? (
              <>
                <DropzoneUserSelectField
                  name="dzso"
                  label="DZSO"
                  requiredPermissions={[Permission.ActAsDzso]}
                  {...{ control }}
                />
                <FormTextField
                  mode="flat"
                  numberOfLines={5}
                  placeholder="Any notes for the day? e.g hours of CI attendance"
                  name="notes"
                  label="Notes"
                  {...{ control }}
                />
              </>
            ) : (
              <>
                <List.Item title={entry?.dzso?.name} description="DZSO" />
                <List.Subheader>Notes</List.Subheader>
                <Paragraph style={{ padding: 16 }}>
                  {entry?.notes || 'No notes for this day'}
                </Paragraph>
              </>
            )}
          </Card.Content>
          <Card.Actions style={{ justifyContent: 'space-between' }}>
            {isEditing && <Button onPress={toggleEditing}>Cancel</Button>}
            {isEditing && (
              <Button mode="contained" onPress={onSubmit} disabled={!isDirty}>
                Save
              </Button>
            )}
            {!isEditing && <Button onPress={toggleEditing}>Edit</Button>}
          </Card.Actions>
        </Card>
        {!data?.masterLog?.loads?.length ? (
          <Card style={{ width: '100%', marginVertical: 16 }}>
            <Card.Content>
              <NoResults title="No loads for this day" subtitle="" />
            </Card.Content>
          </Card>
        ) : null}
        {data?.masterLog?.loads?.map((load) => (
          <Card style={{ width: '100%', marginVertical: 16 }}>
            <Card.Title title={`Load ${load.loadNumber}`} />
            <Card.Content>
              <List.Item title="Pilot" description={load?.pilot?.name} />
              <List.Item title="GCA" description={load?.gca?.name} />
              <List.Item
                title="Plane"
                description={
                  load?.aircraft?.registration
                    ? `${load?.aircraft?.name} ${load?.aircraft?.registration}`
                    : 'No plane selected'
                }
              />
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Name</DataTable.Title>
                  <DataTable.Title>Jump type</DataTable.Title>
                  <DataTable.Title numeric>Altitude</DataTable.Title>
                </DataTable.Header>

                {load.slots?.map((slot) => (
                  <DataTable.Row>
                    <DataTable.Cell>{slot?.name}</DataTable.Cell>
                    <DataTable.Cell>{slot.jumpType}</DataTable.Cell>
                    <DataTable.Cell numeric>{slot?.altitude}</DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            </Card.Content>
          </Card>
        ))}
      </View>
    </Screen>
  );
}
