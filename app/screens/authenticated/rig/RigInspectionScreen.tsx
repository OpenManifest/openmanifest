import { useIsFocused, useNavigation, useRoute } from '@react-navigation/core';
import { startOfDay } from 'date-fns';
import * as React from 'react';
import { Button, Card, Checkbox, Divider, Paragraph } from 'react-native-paper';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import RigInspectionForm from 'app/components/forms/rig_inspection/RigInspectionForm';
import ScrollableScreen from 'app/components/layout/ScrollableScreen';
import {
  QueryDropzoneDocument,
  QueryDropzoneUserProfileDocument,
  useCreateRigInspectionMutation,
  useQueryDropzoneUserProfile,
} from 'app/api/reflection';
import useCurrentDropzone from 'app/api/hooks/useCurrentDropzone';
import { Query, Rig, Permission } from 'app/api/schema.d';
import useRestriction from 'app/hooks/useRestriction';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import {
  QueryDropzoneUserProfileQuery,
  QueryDropzoneUserProfileQueryVariables,
} from 'app/api/operations';
import RigCard from '../equipment/RigCard';

export default function RigInspectionScreen() {
  const state = useAppSelector((root) => root.forms.rigInspection);
  const currentDropzone = useCurrentDropzone();
  const dispatch = useAppDispatch();

  const route = useRoute<{
    key: string;
    name: string;
    params: { rig: Rig; dropzoneUserId: number; userId: number };
  }>();
  const { rig, dropzoneUserId } = route.params;
  const { data, refetch } = useQueryDropzoneUserProfile({
    variables: {
      dropzoneId: Number(currentDropzone?.dropzone?.id),
      dropzoneUserId,
    },
  });

  const isFocused = useIsFocused();

  React.useEffect(() => {
    refetch();
  }, [isFocused, refetch]);

  const canInspect = useRestriction(Permission.ActAsRigInspector);
  const [mutationCreateRigInspection, mutation] = useCreateRigInspectionMutation();
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
          const result = client.readQuery<
            QueryDropzoneUserProfileQuery,
            QueryDropzoneUserProfileQueryVariables
          >({
            query: QueryDropzoneUserProfileDocument,
            variables: {
              dropzoneId: Number(currentDropzone?.dropzone?.id),
              dropzoneUserId: Number(rigInspection?.dropzoneUser?.id),
            },
          });

          const currentDz = client.readQuery<Query>({
            query: QueryDropzoneDocument,
            variables: {
              dropzoneId: Number(currentDropzone?.dropzone?.id),
              earliestTimestamp: startOfDay(new Date()).getTime() / 1000,
            },
          });

          if (currentDz?.dropzone?.currentUser?.id === rigInspection?.dropzoneUser?.id) {
            client.writeQuery({
              query: QueryDropzoneDocument,
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
            query: QueryDropzoneUserProfileDocument,
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
        behavior={Platform.OS === 'android' ? undefined : 'padding'}
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
            {canInspect ? null : (
              <Paragraph>
                You need Rig Inspector permissions to update this form, but you can still view it.
              </Paragraph>
            )}
            <View style={{ flex: 1, flexGrow: 1, opacity: canInspect ? 1.0 : 0.6 }}>
              <RigInspectionForm />
            </View>

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
