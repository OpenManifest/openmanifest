import { useMutation, useQuery } from '@apollo/client';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/core';
import { format, startOfDay } from 'date-fns';
import gql from 'graphql-tag';
import * as React from 'react';
import { Button, Card, Checkbox, Divider, List } from 'react-native-paper';
import { KeyboardAvoidingView } from 'react-native';
import RigInspectionForm from '../../../components/forms/rig_inspection/RigInspectionForm';
import ScrollableScreen from '../../../components/layout/ScrollableScreen';
import useCurrentDropzone, { QUERY_DROPZONE } from '../../../api/hooks/useCurrentDropzone';
import { Mutation, Query, Rig, Permission } from '../../../api/schema.d';
import useRestriction from '../../../hooks/useRestriction';
import { actions, useAppDispatch, useAppSelector } from '../../../state';
import { QUERY_DROPZONE_USER } from '../../../api/hooks/useDropzoneUser';
import RigCard from '../equipment/RigCard';

const QUERY_RIG_INSPECTIONS = gql`
  query RigInspections($dropzoneUserId: Int, $dropzoneId: Int!, $userId: Int) {
    dropzone(id: $dropzoneId) {
      id

      rigInspectionTemplate {
        id
        name
        definition
      }

      dropzoneUser(id: $dropzoneUserId, userId: $userId) {
        id
        rigInspections {
          id
          isOk
          definition
          rig {
            id
            name
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
  mutation CreateRigInspection($dropzoneId: Int, $rigId: Int, $isOk: Boolean, $definition: String) {
    createRigInspection(
      input: {
        attributes: { dropzoneId: $dropzoneId, rigId: $rigId, isOk: $isOk, definition: $definition }
      }
    ) {
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
          name
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
  const state = useAppSelector((root) => root.forms.rigInspection);
  const currentDropzone = useCurrentDropzone();
  const dispatch = useAppDispatch();

  const route = useRoute<{
    key: string;
    name: string;
    params: { rig: Rig; dropzoneUserId: number; userId: number };
  }>();
  const { rig, dropzoneUserId, userId } = route.params;
  const { data, refetch } = useQuery<Query>(QUERY_RIG_INSPECTIONS, {
    variables: {
      dropzoneId: Number(currentDropzone?.dropzone?.id),
      dropzoneUserId,
      userId,
    },
  });

  const isFocused = useIsFocused();

  React.useEffect(() => {
    refetch();
  }, [isFocused, refetch]);

  const canInspect = useRestriction(Permission.ActAsRigInspector);
  const [mutationCreateRigInspection, mutation] = useMutation<Mutation>(
    MUTATION_CREATE_RIG_INSPECTION
  );
  const navigation = useNavigation();
  React.useEffect(() => {
    const hasExistingRigInspection = data?.dropzone?.dropzoneUser?.rigInspections?.some(
      (inspection) => inspection.rig?.id?.toString() === rig.id?.toString() && inspection.definition
    );

    if (hasExistingRigInspection) {
      const inspection = data?.dropzone?.dropzoneUser?.rigInspections?.find(
        (record) => record.rig?.id === rig.id
      );

      if (inspection) {
        dispatch(actions.forms.rigInspection.setFields(inspection.definition || '{}'));
        dispatch(actions.forms.rigInspection.setOk(inspection.isOk));
      }
    } else {
      dispatch(
        actions.forms.rigInspection.setFields(
          data?.dropzone.rigInspectionTemplate?.definition || '[]'
        )
      );
    }
  }, [
    data?.dropzone?.dropzoneUser?.rigInspections,
    data?.dropzone.rigInspectionTemplate?.definition,
    dispatch,
    rig.id,
  ]);

  const createRigInspection = React.useCallback(async () => {
    try {
      await mutationCreateRigInspection({
        variables: {
          dropzoneId: Number(currentDropzone?.dropzone?.id),
          rigId: Number(rig.id),
          definition: JSON.stringify(state.fields),
          isOk: !!state.ok,
        },
        update: async (client, mutationResult) => {
          const rigInspection = mutationResult.data?.createRigInspection?.rigInspection;
          const result = client.readQuery<Query>({
            query: QUERY_DROPZONE_USER,
            variables: {
              dropzoneId: Number(currentDropzone?.dropzone?.id),
              dropzoneUserId: Number(rigInspection?.dropzoneUser?.id),
            },
          });

          const currentDz = client.readQuery<Query>({
            query: QUERY_DROPZONE,
            variables: {
              dropzoneId: Number(currentDropzone?.dropzone?.id),
              earliestTimestamp: startOfDay(new Date()).getTime() / 1000,
            },
          });

          if (currentDz?.dropzone?.currentUser?.id === rigInspection?.dropzoneUser?.id) {
            client.writeQuery({
              query: QUERY_DROPZONE,
              variables: {
                dropzoneId: Number(currentDropzone?.dropzone?.id),
                earliestTimestamp: startOfDay(new Date()).getTime() / 1000,
              },
              data: {
                ...currentDz,
                dropzone: {
                  ...currentDz?.dropzone,
                  currentUser: {
                    ...currentDz?.dropzone?.currentUser,
                    rigInspections: [
                      ...(currentDz?.dropzone?.currentUser?.rigInspections || []).filter(
                        (ins) => ins.id !== rigInspection?.id
                      ),
                      rigInspection,
                    ],
                  },
                },
              },
            });
          }

          const newData = {
            ...result?.dropzone,
            dropzoneUser: {
              ...result?.dropzone?.dropzoneUser,
              rigInspections: [
                ...(result?.dropzone?.dropzoneUser?.rigInspections || []).filter(
                  (ins) => ins.id !== rigInspection?.id
                ),
                rigInspection,
              ],
            },
          };

          client.writeQuery({
            query: QUERY_DROPZONE_USER,
            variables: {
              dropzoneId: Number(currentDropzone?.dropzone?.id),
              dropzoneUserId: Number(rigInspection?.dropzoneUser?.id),
            },
            data: newData,
          });
          return {
            data: newData,
          };
        },
      });

      dispatch(
        actions.notifications.showSnackbar({
          message: 'Rig inspection saved',
          variant: 'success',
        })
      );
      dispatch(actions.forms.rigInspection.reset());
      navigation.goBack();
    } catch (error) {
      dispatch(
        actions.notifications.showSnackbar({
          message: error.message,
          variant: 'error',
        })
      );
    }
  }, [
    mutationCreateRigInspection,
    currentDropzone?.dropzone?.id,
    rig.id,
    state.fields,
    state.ok,
    dispatch,
    navigation,
  ]);

  return (
    <ScrollableScreen>
      <KeyboardAvoidingView
        behavior="position"
        style={{
          width: '100%',
          flexGrow: 1,
          maxWidth: 400,
          backgroundColor: 'transparent',
        }}
      >
        <RigCard rig={rig} />

        <Card style={{ width: '100%' }}>
          <Card.Title title={data?.dropzone?.rigInspectionTemplate?.name} />

          <Card.Content>
            <RigInspectionForm />

            <Divider />
            <Checkbox.Item
              mode="android"
              label="This rig is OK to jump"
              onPress={() => dispatch(actions.forms.rigInspection.setOk(!state.ok))}
              status={state.ok ? 'checked' : 'unchecked'}
            />
          </Card.Content>

          <Card.Actions>
            <Button
              disabled={
                !canInspect ||
                JSON.stringify(state.fields) === data?.dropzone?.rigInspectionTemplate?.definition
              }
              mode="contained"
              onPress={() => createRigInspection()}
              loading={mutation.loading}
              style={{ width: '100%' }}
            >
              Mark as inspected
            </Button>
          </Card.Actions>
        </Card>
      </KeyboardAvoidingView>
    </ScrollableScreen>
  );
}
