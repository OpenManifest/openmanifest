import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import * as React from 'react';
import { Card, DataTable, List } from 'react-native-paper';
import startOfDay from 'date-fns/startOfDay';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/core';
import ScrollableScreen from 'app/components/layout/ScrollableScreen';
import { Query } from 'app/api/schema.d';
import DatePicker from 'app/components/input/date_picker/DatePicker';
import { useDropzoneContext } from 'app/api/crud/useDropzone';

const QUERY_MASTER_LOG = gql`
  query MasterLog($dropzoneId: ID!, $timestamp: Int!) {
    dropzone(id: $dropzoneId) {
      id
      masterLog(date: $timestamp) {
        id
        dzso {
          id
          user {
            id
            name
          }
        }

        loads {
          id
          name
          loadNumber

          loadMaster {
            id
            user {
              name
            }
          }

          gca {
            id
            user {
              name
            }
          }

          slots {
            id
            dropzoneUser {
              id
              license {
                id
                name
              }
              user {
                id
                name
              }
            }
            ticketType {
              id
              name
              altitude
            }
            jumpType {
              id
              name
            }
          }
        }
      }
    }
  }
`;
export default function DropzoneMasterLogScreen() {
  const currentDropzone = useDropzoneContext();
  const [timestamp, setTimestamp] = React.useState(startOfDay(new Date()).getTime());
  const navigation = useNavigation();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <DatePicker
          onChange={(time) => setTimestamp(time * 1000)}
          value={timestamp / 1000}
          color="#FFFFFF"
        />
      ),
    });
  }, [navigation, timestamp]);

  const { data } = useQuery<Query>(QUERY_MASTER_LOG, {
    variables: {
      dropzoneId: currentDropzone?.dropzone?.id?.toString() as string,
      timestamp: Math.floor(timestamp / 1000),
    },
  });

  return (
    <ScrollableScreen>
      <View style={{ width: '100%' }} />
      {data?.dropzone?.masterLog?.loads?.map((load) => (
        <Card style={{ width: '100%', marginVertical: 16 }}>
          <Card.Title title={`Load ${load.loadNumber}`} />
          <Card.Content>
            <List.Item title="Pilot" description={load?.pilot?.user?.name} />
            <List.Item title="GCA" description={load?.gca?.user?.name} />
            <List.Item
              title="Plane"
              description={
                load?.plane?.id
                  ? `${load?.plane?.name} (${load?.plane?.registration})`
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
                  <DataTable.Cell>{slot.dropzoneUser?.user?.name}</DataTable.Cell>
                  <DataTable.Cell>{slot.jumpType?.name}</DataTable.Cell>
                  <DataTable.Cell numeric>{slot.ticketType?.altitude}</DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </Card.Content>
        </Card>
      ))}
    </ScrollableScreen>
  );
}
