import { useMutation, useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import * as React from 'react';
import { Button, Card } from 'react-native-paper';
import RigInspectionTemplateForm from "../../../components/forms/rig_inspection_template/RigInspectionTemplateForm";
import ScrollableScreen from '../../../components/layout/ScrollableScreen';
import { Mutation, Query } from '../../../graphql/schema';
import useRestriction from '../../../hooks/useRestriction';
import { actions, useAppDispatch, useAppSelector } from '../../../redux';

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
  mutation UpdateRigInspectionTemplate(
    $dropzoneId: Int,
    $formId: Int,
    $definition: String
  ) {
    updateFormTemplate(input: {
      id: $formId
      attributes: {
        dropzoneId: $dropzoneId,
        definition: $definition
      }
    }) {
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
  const globalState = useAppSelector(state => state.global);
  const state = useAppSelector(state => state.forms.rigInspectionTemplate);
  const dispatch = useAppDispatch();
  const { data, loading } = useQuery<Query>(QUERY_RIG_INSPECTION, {
    variables: {
      dropzoneId: Number(globalState?.currentDropzone?.id)
    }
  });

  const canEdit = useRestriction("updateFormTemplate");
  const [mutationUpdateForm, mutation] = useMutation<Mutation>(MUTATION_UPDATE_FORM);

  React.useEffect(() => {
    if (data?.dropzone?.rigInspectionTemplate) {
      
      dispatch(
        actions.forms.rigInspectionTemplate.setOpen(
          data.dropzone.rigInspectionTemplate
        )
      )
    }
  }, [JSON.stringify(data?.dropzone?.rigInspectionTemplate)]);

  const updateForm = React.useCallback(async () => {
    try {
      await mutationUpdateForm({
          variables: {
            formId: Number(data?.dropzone.rigInspectionTemplate!.id),
            dropzoneId: Number(data?.dropzone?.id),
            definition: JSON.stringify(state.fields),
        }
      });
      dispatch(actions.notifications.showSnackbar({ message: "Template saved", variant: "success" }));
    } catch(error) {
      dispatch(actions.notifications.showSnackbar({ message: error.message, variant: "error" }));
    }
  }, [JSON.stringify(state.fields), state?.original?.id, globalState?.currentDropzone?.id]);

  return (
    <ScrollableScreen>

      <Card style={{ width: "100%"}}>
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
            style={{ width: "100%"}}
          >
            Save template
          </Button>
        </Card.Actions>
      </Card>
    </ScrollableScreen>
  );
}

