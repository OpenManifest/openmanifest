import { useMutation, useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import * as React from 'react';
import { Button, Card } from 'react-native-paper';
// eslint-disable-next-line max-len
import RigInspectionTemplateForm from '../../../components/forms/rig_inspection_template/RigInspectionTemplateForm';
import ScrollableScreen from '../../../components/layout/ScrollableScreen';
import useCurrentDropzone from '../../../api/hooks/useCurrentDropzone';
import { Mutation, Permission, Query } from '../../../api/schema.d';
import useRestriction from '../../../hooks/useRestriction';
import { actions, useAppDispatch, useAppSelector } from '../../../state';

const QUERY_RIG_INSPECTION = gql`
  query RigInspection($dropzoneId: Int!) {
    dropzone(id: $dropzoneId) {
      id
      rigInspectionTemplate {
        id
        name
        definition
      }
    }
  }
`;

const MUTATION_UPDATE_FORM = gql`
  mutation UpdateRigInspectionTemplate($dropzoneId: Int, $formId: Int, $definition: String) {
    updateFormTemplate(
      input: { id: $formId, attributes: { dropzoneId: $dropzoneId, definition: $definition } }
    ) {
      formTemplate {
        id
        name
        definition
      }
      fieldErrors {
        field
        message
      }
      errors
    }
  }
`;

export default function RigInspectionTemplateScreen() {
  const state = useAppSelector((root) => root.forms.rigInspectionTemplate);
  const currentDropzone = useCurrentDropzone();
  const dispatch = useAppDispatch();
  const { data } = useQuery<Query>(QUERY_RIG_INSPECTION, {
    variables: {
      dropzoneId: Number(currentDropzone?.dropzone?.id),
    },
  });

  const canEdit = useRestriction(Permission.UpdateFormTemplate);
  const [mutationUpdateForm, mutation] = useMutation<Mutation>(MUTATION_UPDATE_FORM);

  React.useEffect(() => {
    if (data?.dropzone?.rigInspectionTemplate) {
      dispatch(actions.forms.rigInspectionTemplate.setOpen(data.dropzone.rigInspectionTemplate));
    }
  }, [data?.dropzone.rigInspectionTemplate, dispatch]);

  const updateForm = React.useCallback(async () => {
    try {
      await mutationUpdateForm({
        variables: {
          formId: Number(data?.dropzone.rigInspectionTemplate?.id),
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
      dispatch(
        actions.notifications.showSnackbar({
          message: error.message,
          variant: 'error',
        })
      );
    }
  }, [
    mutationUpdateForm,
    data?.dropzone.rigInspectionTemplate?.id,
    data?.dropzone?.id,
    state.fields,
    dispatch,
  ]);

  return (
    <ScrollableScreen>
      <Card style={{ width: '100%' }}>
        <Card.Title title="Rig Inspection Form Template" />

        <Card.Content>
          <RigInspectionTemplateForm />
        </Card.Content>

        <Card.Actions>
          <Button
            disabled={!canEdit}
            mode="contained"
            loading={mutation.loading}
            onPress={() => updateForm()}
            style={{ width: '100%' }}
          >
            Save template
          </Button>
        </Card.Actions>
      </Card>
    </ScrollableScreen>
  );
}
