import { RouteProp, useNavigation, useRoute } from '@react-navigation/core';
import { startOfDay } from 'date-fns';
import * as React from 'react';
import { Button, Card, Checkbox, Divider, Paragraph } from 'react-native-paper';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import RigInspectionForm from 'app/components/forms/rig_inspection/RigInspectionForm';
import {
  DropzoneDocument,
  DropzoneUserProfileDocument,
  useCreateRigInspectionMutation,
  useRigInspectionTemplateQuery,
} from 'app/api/reflection';
import { useDropzoneContext } from 'app/providers';
import { Query, Permission } from 'app/api/schema.d';
import useRestriction from 'app/hooks/useRestriction';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import { DropzoneUserProfileQuery, DropzoneUserProfileQueryVariables } from 'app/api/operations';
import { useUserProfile } from 'app/api/crud';
import { Screen } from 'app/components/layout';
import { useNotifications } from 'app/providers/notifications';
import RigCard from '../equipment/RigCard';

export type RigInspectionRoute = {
  RigInspectionScreen: {
    rigId: string;
    dropzoneUserId: string;
  };
};
export default function RigInspectionScreen() {
  const state = useAppSelector((root) => root.forms.rigInspection);
  const { dropzone: currentDropzone } = useDropzoneContext();
  const dispatch = useAppDispatch();

  const notify = useNotifications();
  const route = useRoute<RouteProp<RigInspectionRoute>>();
  const { rigId, dropzoneUserId } = route.params;
  const { dropzoneUser } = useUserProfile({
    id: dropzoneUserId,
  });
  const { data: rigInspectionQuery } = useRigInspectionTemplateQuery({
    variables: {
      dropzoneId: currentDropzone?.dropzone?.id as string,
    },
    skip: !currentDropzone?.dropzone?.id,
  });

  const rig = React.useMemo(
    () => dropzoneUser?.user?.rigs?.find(({ id }) => id === rigId),
    [dropzoneUser?.user?.rigs, rigId]
  );

  const canInspect = useRestriction(Permission.ActAsRigInspector);
  const [mutationCreateRigInspection, mutation] = useCreateRigInspectionMutation();
  const navigation = useNavigation();
  React.useEffect(() => {
    const hasExistingRigInspection = dropzoneUser?.rigInspections?.some(
      (inspection) =>
        inspection.rig?.id?.toString() === rig?.id?.toString() && inspection.definition
    );

    if (hasExistingRigInspection) {
      const inspection = dropzoneUser?.rigInspections?.find((record) => record.rig?.id === rig?.id);

      if (inspection) {
        dispatch(actions.forms.rigInspection.setFields(inspection.definition || '{}'));
        dispatch(actions.forms.rigInspection.setOk(inspection.isOk));
      }
    } else {
      dispatch(
        actions.forms.rigInspection.setFields(
          rigInspectionQuery?.dropzone?.rigInspectionTemplate?.definition || '[]'
        )
      );
    }
  }, [
    rigInspectionQuery?.dropzone?.rigInspectionTemplate?.definition,
    dispatch,
    rig?.id,
    dropzoneUser?.rigInspections,
  ]);

  const createRigInspection = React.useCallback(async () => {
    try {
      await mutationCreateRigInspection({
        variables: {
          dropzone: currentDropzone?.dropzone?.id,
          rig: rig?.id,
          definition: JSON.stringify(state.fields),
          isOk: !!state.ok,
        },
        update: async (client, mutationResult) => {
          const rigInspection = mutationResult.data?.createRigInspection?.rigInspection;
          const result = client.readQuery<
            DropzoneUserProfileQuery,
            DropzoneUserProfileQueryVariables
          >({
            query: DropzoneUserProfileDocument,
            variables: {
              id: currentDropzone?.dropzone?.id as string,
            },
          });

          const currentDz = client.readQuery<Query>({
            query: DropzoneDocument,
            variables: {
              dropzoneId: currentDropzone?.dropzone?.id?.toString() as string,
              earliestTimestamp: startOfDay(new Date()).toISOString(),
            },
          });

          if (currentDz?.dropzone?.currentUser?.id === rigInspection?.dropzoneUser?.id) {
            client.writeQuery({
              query: DropzoneDocument,
              variables: {
                dropzoneId: currentDropzone?.dropzone?.id?.toString() as string,
                earliestTimestamp: startOfDay(new Date()).toISOString(),
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
            dropzoneUser: {
              rigInspections: [
                ...(result?.dropzoneUser?.rigInspections || []).filter(
                  (ins) => ins.id !== rigInspection?.id
                ),
                rigInspection,
              ],
            },
          };

          client.writeQuery({
            query: DropzoneUserProfileDocument,
            variables: {
              dropzoneId: currentDropzone?.dropzone?.id?.toString() as string,
              dropzoneUserId: Number(rigInspection?.dropzoneUser?.id),
            },
            data: newData,
          });
          return {
            data: newData,
          };
        },
      });

      notify.success('Rig inspection saved');
      dispatch(actions.forms.rigInspection.reset());
      navigation.goBack();
    } catch (error) {
      if (error instanceof Error) {
        notify.error(error.message);
      }
    }
  }, [
    mutationCreateRigInspection,
    currentDropzone?.dropzone?.id,
    rig?.id,
    state.fields,
    state.ok,
    notify,
    dispatch,
    navigation,
  ]);

  return (
    <Screen fullWidth={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'android' ? undefined : 'padding'}
        style={{
          width: '100%',
          flexGrow: 1,
          backgroundColor: 'transparent',
        }}
      >
        {rig && <RigCard {...{ rig }} />}

        <Card style={{ width: '100%' }}>
          <Card.Title title={rigInspectionQuery?.dropzone?.rigInspectionTemplate?.name} />

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
                JSON.stringify(state.fields) ===
                  rigInspectionQuery?.dropzone?.rigInspectionTemplate?.definition
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
    </Screen>
  );
}
