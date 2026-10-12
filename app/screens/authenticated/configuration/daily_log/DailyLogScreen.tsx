import * as React from 'react';
import { formatQuantity } from 'app/i18n/format';
import { Button, Card, DataTable, IconButton, List, Paragraph } from 'react-native-paper';
import { Linking, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FormColumn, { FORM_COLUMN_WIDE_MAX_WIDTH } from 'app/components/layout/FormColumn';
import DatePicker from 'app/components/input/date_picker/DatePicker';
import { useOperatorContext } from 'app/providers/operator/context';
import { useDailyLogQuery } from 'app/api/reflection';
import { DailyLogQueryVariables } from 'app/api/operations';
import { DateTime } from 'luxon';
import { FormTextField } from 'app/components/input/text/TextField';
import { MembershipSelectField } from 'app/components/input/dropdown_select';
import { Permission } from 'app/api/schema.d';
import usePalette from 'app/hooks/usePalette';
import NoResults from 'app/components/NoResults';
import useDailyLogForm from './useForm';

export default function OperatorDailyLogScreen() {
  const { operator: currentOperator } = useOperatorContext();
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
          value={date ? DateTime.fromISO(date).toSeconds() : DateTime.local().toSeconds()}
          color={theme.text}
        />
      ),
    });
  }, [date, navigation, theme.text]);

  const variables: DailyLogQueryVariables = React.useMemo(
    () => ({
      operatorId: currentOperator?.operator?.id?.toString() as string,
      date,
    }),
    [currentOperator?.operator?.id, date]
  );

  const { data } = useDailyLogQuery({ variables, skip: !currentOperator?.operator?.id });
  const entry = React.useMemo(() => data?.dailyLog, [data?.dailyLog]);

  const onDownload = React.useCallback(() => {
    if (data?.dailyLog?.downloadUrl) {
      Linking.openURL(data?.dailyLog?.downloadUrl);
    }
  }, [data?.dailyLog?.downloadUrl]);

  const { control, onSubmit, isDirty } = useDailyLogForm({
    initial: {
      date,
      notes: entry?.notes,
      dutyOfficer: entry?.dutyOfficer,
    },
    onSuccess: () => setIsEditing(false),
  });

  return (
    <FormColumn maxWidth={FORM_COLUMN_WIDE_MAX_WIDTH}>
      <View style={{ width: '100%', paddingTop: 48 }}>
        <Card>
          <Card.Title
            right={() => (
              <IconButton icon="download" onPress={onDownload} style={{ marginRight: 8 }} />
            )}
            title={`${DateTime.fromISO(date || new Date().toISOString()).toLocaleString(
              DateTime.DATE_MED_WITH_WEEKDAY
            )}`}
          />
          <Card.Content>
            {isEditing ? (
              <>
                <MembershipSelectField
                  name="dutyOfficer"
                  label="DZSO"
                  requiredPermissions={[Permission.ActAsDutyOfficer]}
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
                <List.Item title={entry?.dutyOfficer?.name} description="DZSO" />
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
        {!data?.dailyLog?.loads?.length ? (
          <Card style={{ width: '100%', marginVertical: 16 }}>
            <Card.Content>
              <NoResults title="No loads for this day" subtitle="" />
            </Card.Content>
          </Card>
        ) : null}
        {data?.dailyLog?.loads?.map((load) => (
          <Card style={{ width: '100%', marginVertical: 16 }}>
            <Card.Title title={`Load ${load.loadNumber}`} />
            <Card.Content>
              <List.Item title="Pilot" description={load?.pilot?.name} />
              <List.Item title="GCA" description={load?.gca?.name} />
              <List.Item
                title="Plane"
                description={
                  load?.vehicle?.registration
                    ? `${load?.vehicle?.name} ${load?.vehicle?.registration}`
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
                    <DataTable.Cell>{slot.activityType}</DataTable.Cell>
                    <DataTable.Cell numeric>
                      {formatQuantity(slot?.altitudeM, 'altitude')}
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            </Card.Content>
          </Card>
        ))}
      </View>
    </FormColumn>
  );
}
