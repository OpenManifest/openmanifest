import { useMutation, useQuery } from '@apollo/client';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/core';
import { format, startOfDay } from 'date-fns';
import gql from 'graphql-tag';
import * as React from 'react';
import { Button, Card, Checkbox, Divider, List } from 'react-native-paper';
import RigInspectionForm from "../../../components/forms/rig_inspection/RigInspectionForm";
import ScrollableScreen from '../../../components/layout/ScrollableScreen';
import useCurrentDropzone from '../../../graphql/hooks/useCurrentDropzone';
import { Mutation, Query, Rig, Permission } from '../../../graphql/schema.d';
import useRestriction from '../../../hooks/useRestriction';
import { actions, useAppDispatch, useAppSelector } from '../../../redux';
import { QUERY_DROPZONE_USER } from '../../../graphql/hooks/useDropzoneUser';
import { QUERY_DROPZONE } from '../../../graphql/hooks/useCurrentDropzone';
import { KeyboardAvoidingView } from 'react-native';

const QUERY_RIG_INSPECTIONS = gql`
  query RigInspections($dropzoneUserId: Int!, $dropzoneId: Int!) {
    dropzone(id: $dropzoneId) {
      id

      rigInspectionTemplate {
        id
        name
        definition
      }

      dropzoneUser(id: $dropzoneUserId) {
        id
        rigInspections {
          id
          isOk
          definition
          rig {
            id
          }
          inspectedBy {
            id
            user {
              id
              name
            }
          }
          formTemplate {
            id
            name
            definition
          }
        }
      }
    }
  }
`;

const MUTATION_CREATE_RIG_INSPECTION = gql`
  mutation CreateRigInspection(
    $dropzoneId: Int,
    $rigId: Int,
    $isOk: Boolean,
    $definition: String,
  ) {
    createRigInspection(input: {
      attributes: {
        dropzoneId: $dropzoneId,
        rigId: $rigId,
        isOk: $isOk,
        definition: $definition,
      }
    }) {
      rigInspection {
        id
        isOk
        definition
        dropzoneUser {
          id
          rigInspections {
            id
            isOk
            rig {
              id
            }
            inspectedBy {
              id
              user {
                id
                name
              }
            }
          }
        }
        inspectedBy {
          id
          user {
            id
            name
          }
        }
        rig {
          id
          make
          model
        }
        
        formTemplate {
          id
          definition
        }
      }
      fieldErrors {
        field
        message
      }
      errors
    }
  }
`;

export default function RigInspectionScreen() {
  const state = useAppSelector(state => state.forms.rigInspection);
  const currentDropzone = useCurrentDropzone();
  const dispatch = useAppDispatch();
  
  const route = useRoute<{ key: string, name: string, params: { rig: Rig, dropzoneUserId: number }}>();
  const { rig, dropzoneUserId } = route.params;
  const { data, loading, refetch } = useQuery<Query>(QUERY_RIG_INSPECTIONS, {
    variables: {
      dropzoneId: Number(currentDropzone?.dropzone?.id),
      dropzoneUserId: dropzoneUserId,
    }
  });

  const isFocused = useIsFocused();

  React.useEffect(() => {
    refetch();
  }, [isFocused])

  const canInspect = useRestriction(Permission.ActAsRigInspector);
  const [mutationCreateRigInspection, mutation] = useMutation<Mutation>(MUTATION_CREATE_RIG_INSPECTION);
  const navigation = useNavigation();
  React.useEffect(() => {

    const hasExistingRigInspection = data?.dropzone?.dropzoneUser?.rigInspections?.some((inspection) => inspection.rig?.id.toString() === rig.id.toString() && inspection.definition);

    if (hasExistingRigInspection) {
      const inspection = data?.dropzone?.dropzoneUser?.rigInspections?.find((inspection) => inspection.rig?.id === rig.id);
      
      dispatch(
        actions.forms.rigInspection.setFields(
          inspection!.definition || "{}"
        )
      );

      dispatch(
        actions.forms.rigInspection.setOk(
          inspection!.isOk
        )
      );
    } else {
      dispatch(
        actions.forms.rigInspection.setFields(
          data?.dropzone.rigInspectionTemplate?.definition || '[]',
        )
      )
    }
  }, [JSON.stringify(data?.dropzone?.dropzoneUser?.rigInspections), data?.dropzone?.rigInspectionTemplate?.definition]);

  const createRigInspection = React.useCallback(async () => {
    try {
      const result = await mutationCreateRigInspection({
        variables: {
          dropzoneId: Number(currentDropzone?.dropzone?.id),
          rigId: Number(rig.id),
          definition: JSON.stringify(state.fields),
          isOk: !!state.ok,
        },
        update: async (client, { data }) => {

          const { rigInspection } = data?.createRigInspection;
          const result = client.readQuery<Query>({
            query: QUERY_DROPZONE_USER,
            variables: {
              dropzoneId: Number(currentDropzone?.dropzone?.id),
              dropzoneUserId: Number(rigInspection?.dropzoneUser?.id),
            }
          });

          const currentDz = client.readQuery<Query>({
            query: QUERY_DROPZONE,
            variables: {
              dropzoneId: Number(currentDropzone?.dropzone?.id),
              earliestTimestamp: startOfDay(new Date()).getTime() / 1000
            }
          });

          if (currentDz?.dropzone?.currentUser?.id === rigInspection?.dropzoneUser?.id) {
            client.writeQuery({
              query: QUERY_DROPZONE,
              variables: {
                dropzoneId: Number(currentDropzone?.dropzone?.id),
                earliestTimestamp: startOfDay(new Date()).getTime() / 1000
              },
              data: {
                ...currentDz,
                dropzone: {
                  ...currentDz?.dropzone,
                  currentUser: {
                    ...currentDz?.dropzone?.currentUser,
                    rigInspections: [
                      ...(currentDz.dropzone?.currentUser?.rigInspections || []).filter((ins) => ins.id !== data?.createRigInspection?.rigInspection?.id),
                      rigInspection,
                    ]
                  }
                }
              }
            })
          } 

          const newData = {
            ...result.dropzone,
            dropzoneUser: {
              ...result.dropzone?.dropzoneUser,
              rigInspections: [
                ...(result.dropzone?.dropzoneUser?.rigInspections || []).filter((ins) => ins.id !== data?.createRigInspection?.rigInspection?.id),
                rigInspection,
              ]
            }
          };


          client.writeQuery({
            query: QUERY_DROPZONE_USER,
            variables: {
              dropzoneId: Number(currentDropzone?.dropzone?.id),
              dropzoneUserId: Number(data?.createRigInspection?.rigInspection?.dropzoneUser?.id),
            },
            data: newData
          });
          return {
            data: newData,
          };
        }
      });

      console.log(result?.data?.createRigInspection);

      dispatch(
        actions.notifications.showSnackbar({ message: "Rig inspection saved", variant: "success" })
      );
      dispatch(actions.forms.rigInspection.reset());
      navigation.goBack();

    } catch(error) {
      dispatch(actions.notifications.showSnackbar({ message: error.message, variant: "error" }));
    }
  }, [JSON.stringify(state.fields), state.ok, currentDropzone?.dropzone?.id]);

  return (
    <ScrollableScreen>
      <KeyboardAvoidingView
        behavior="position"
        style={{
          width: "100%",
          flexGrow: 1,
          maxWidth: 400,
          backgroundColor: "transparent"
      }}
      >
      <Card style={{ width: "100%", marginVertical: 16 }}>
        <Card.Title title="Rig" />
        <Card.Content>
          <List.Item
            title="Make"
            description={rig.make}
          />
          <List.Item
            title="Model"
            description={rig.model}
          />
          <List.Item
            title="Serial"
            description={rig.serial}
          />
          <List.Item
            title="Repack due"
            description={
              rig?.repackExpiresAt ? format(rig.repackExpiresAt * 1000, "yyyy/MM/dd") : "-"
            }
          />
        </Card.Content>
      </Card>

      
      <Card style={{ width: "100%"}}>
        <Card.Title title={data?.dropzone?.rigInspectionTemplate?.name} />

        <Card.Content>
          <RigInspectionForm />

          <Divider />
          <Checkbox.Item
            mode="android"
            label="This rig is OK to jump"
            onPress={() => dispatch(actions.forms.rigInspection.setOk(!state.ok))}
            status={state.ok ? "checked" : "unchecked"}
          />
        </Card.Content>

        <Card.Actions>
          <Button
            disabled={!canInspect || JSON.stringify(state.fields) === data?.dropzone?.rigInspectionTemplate?.definition}
            mode="contained"
            onPress={() => createRigInspection()}
            loading={mutation.loading}
            style={{ width: "100%"}}
          >
            Mark as inspected
          </Button>
        </Card.Actions>
      </Card>
      </KeyboardAvoidingView>
    </ScrollableScreen>
  );
}

