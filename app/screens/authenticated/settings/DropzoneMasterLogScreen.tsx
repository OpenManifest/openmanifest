import { useQuery } from "@apollo/client";
import groupBy from "lodash/groupBy";
import flatten from "lodash/flatten";
import gql from "graphql-tag";
import * as React from "react";
import { Card, DataTable, List } from "react-native-paper";
import startOfDay from "date-fns/startOfDay";
import ScrollableScreen from "../../../components/layout/ScrollableScreen";
import { Query, Slot } from "../../../graphql/schema.d";
import DatePicker from "../../../components/input/date_picker/DatePicker";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/core";
import useCurrentDropzone from "../../../graphql/hooks/useCurrentDropzone";

const QUERY_MASTER_LOG = gql`
query MasterLog($dropzoneId: Int!, $timestamp: Int!) {
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
          user {
            id
            name
            license {
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
  const currentDropzone = useCurrentDropzone();
  const [timestamp, setTimestamp] = React.useState(startOfDay(new Date()).getTime());
  const navigation = useNavigation();


  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        <DatePicker
          onChange={(time) => setTimestamp(time * 1000)}
          timestamp={timestamp / 1000}
          color="#FFFFFF"
        />
    })
  }, [navigation, timestamp])

  const { data } = useQuery<Query>(QUERY_MASTER_LOG, {
    variables: {
      dropzoneId: Number(currentDropzone?.dropzone?.id),
      timestamp: Math.floor(timestamp / 1000),
    },
  });

  const allSlots = flatten(
    data?.dropzone?.masterLog?.loads?.map(({ slots }) => slots)
  ) as Slot[];

  const slotsByJumpType = groupBy(
    allSlots,
    ({ jumpType }) => jumpType?.name,
  );

  return (
    <ScrollableScreen>
      <View style={{ width: "100%" }}>
        
      </View>
      {
        data?.dropzone?.masterLog?.loads?.map((load) =>
          <Card style={{ width: "100%", marginVertical: 16 }}>
            <Card.Title title={`Load ${load.loadNumber}`} />
            <Card.Content>
              <List.Item
                title="Pilot"
                description={load?.pilot?.user?.name}
              />
              <List.Item
                title="GCA"
                description={load?.gca?.user?.name}
              />
              <List.Item
                title="Plane"
                description={
                  load?.plane?.id ? `${load?.plane?.name} (${load?.plane?.registration})` : "No plane selected"
                }
              />
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Name</DataTable.Title>
                  <DataTable.Title>Jump type</DataTable.Title>
                  <DataTable.Title numeric>Altitude</DataTable.Title>
                </DataTable.Header>

                {
                  load.slots?.map((slot) =>
                    <DataTable.Row>
                      <DataTable.Cell>{slot.user?.name}</DataTable.Cell>
                      <DataTable.Cell>{slot.jumpType?.name}</DataTable.Cell>
                      <DataTable.Cell numeric>{slot.ticketType?.altitude}</DataTable.Cell>
                    </DataTable.Row>
                  )
                }
              </DataTable>
            </Card.Content>
          </Card>
        )
      }
    </ScrollableScreen>
  );
}