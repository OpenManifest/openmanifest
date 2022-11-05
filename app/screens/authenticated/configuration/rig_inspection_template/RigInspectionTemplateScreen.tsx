import * as React from 'react';
import { Button, Card } from 'react-native-paper';
// eslint-disable-next-line max-len
import {
  useRigInspectionTemplateQuery,
  useUpdateRigInspectionTemplateMutation,
} from 'app/api/reflection';
// eslint-disable-next-line max-len
import RigInspectionTemplateForm from 'app/components/forms/rig_inspection_template/RigInspectionTemplateForm';
import ScrollableScreen from 'app/components/layout/ScrollableScreen';
import { useDropzoneContext } from 'app/api/crud/useDropzone';
import { FormTemplate, Permission } from 'app/api/schema.d';
import useRestriction from 'app/hooks/useRestriction';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import { useWindowDimensions, View } from 'react-native';

export default function RigInspectionTemplateScreen() {
  const state = useAppSelector((root) => root.forms.rigInspectionTemplate);
  const currentDropzone = useDropzoneContext();
  const dispatch = useAppDispatch();
  const { data } = useRigInspectionTemplateQuery({
    variables: {
      dropzoneId: currentDropzone?.dropzone?.id?.toString() as string,
    },
  });

  const canEdit = useRestriction(Permission.UpdateFormTemplate);
  const [mutationUpdateForm, mutation] = useUpdateRigInspectionTemplateMutation();

  React.useEffect(() => {
    if (data?.dropzone?.rigInspectionTemplate) {
      dispatch(
        actions.forms.rigInspectionTemplate.setOpen(
          data.dropzone.rigInspectionTemplate as FormTemplate
        )
      );
    }
  }, [data?.dropzone?.rigInspectionTemplate, dispatch]);

  const updateForm = React.useCallback(async () => {
    try {
      await mutationUpdateForm({
        variables: {
          formId: Number(data?.dropzone?.rigInspectionTemplate?.id),
          dropzoneId: Number(data?.dropzone?.id),
          definition: JSON.stringify(state.fields),
        },
      });
      dispatch(
        actions.notifications.showSnackbar({
          message: 'Template saved',
          variant: 'success',
        })
      );
    } catch (error) {
      if (error instanceof Error) {
        dispatch(
          actions.notifications.showSnackbar({
            message: error.message,
            variant: 'error',
          })
        );
      }
    }
  }, [
    mutationUpdateForm,
    data?.dropzone?.rigInspectionTemplate?.id,
    data?.dropzone?.id,
    state.fields,
    dispatch,
  ]);

  const { width } = useWindowDimensions();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ScrollableScreen style={{ marginTop: 16, width: width > 550 ? 550 : '100%' }}>
        <Card style={{ width: '100%' }}>
          <Card.Title title="Rig Inspection Form Template" />

          <Card.Content>
            <RigInspectionTemplateForm />
          </Card.Content>
        </Card>
        <Button
          disabled={!canEdit}
          mode="contained"
          loading={mutation.loading}
          onPress={() => updateForm()}
          style={{ width: '100%', marginTop: 16, borderRadius: 20 }}
        >
          Save template
        </Button>
      </ScrollableScreen>
    </View>
  );
}
