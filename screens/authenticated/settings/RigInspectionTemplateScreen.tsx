import { useMutation, useQuery } from '@apollo/client';
import { useRoute } from '@react-navigation/core';
import { format } from 'date-fns';
import gql from 'graphql-tag';
import * as React from 'react';
import { Button, Card, List } from 'react-native-paper';
import RigInspectionTemplateForm from "../../../components/forms/rig_inspection_template/RigInspectionTemplateForm";
import ScrollableScreen from '../../../components/ScrollableScreen';
import { DropzoneUser, Mutation, Query, Rig } from '../../../graphql/schema';
import useRestriction from '../../../hooks/useRestriction';
import { rigInspectionForm, rigInspectionTemplateForm, snackbarActions, useAppDispatch, useAppSelector } from '../../../redux';

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
  const { global: globalState, rigInspectionTemplate } = useAppSelector(state => state);
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
        rigInspectionTemplateForm.setOriginal(
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
            definition: JSON.stringify(rigInspectionTemplate.fields),
        }
      });
      dispatch(snackbarActions.showSnackbar({ message: "Template saved", variant: "success" }));
    } catch(error) {
      dispatch(snackbarActions.showSnackbar({ message: error.message, variant: "error" }));
    }
  }, [JSON.stringify(rigInspectionTemplate.fields), rigInspectionTemplate?.original?.id, globalState?.currentDropzone?.id]);

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

