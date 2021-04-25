import { useMutation, useQuery } from '@apollo/client';
import { useRoute } from '@react-navigation/core';
import { format } from 'date-fns';
import gql from 'graphql-tag';
import * as React from 'react';
import { Button, Card, List } from 'react-native-paper';
import RigInspectionForm from "../../../components/forms/rig_inspection/RigInspectionForm";
import ScrollableScreen from '../../../components/ScrollableScreen';
import { DropzoneUser, Mutation, Query, Rig } from '../../../graphql/schema';
import useRestriction from '../../../hooks/useRestriction';
import { rigInspectionForm, snackbarActions, useAppDispatch, useAppSelector } from '../../../redux';

const QUERY_RIG_INSPECTIONS = gql`
  query RigInspections($dropzoneUserId: Int!, $dropzoneId: Int!) {
    dropzone(id: $dropzoneId) {
      id
      dropzoneUser(id: $dropzoneUserId) {
        id
        rigInspections {
          id
          rig {
            id
          }
          inspectedBy {
            id
            name
          }
          checklistValues {
            id
            value
            checklistItem {
              id
              name
              valueType
              isRequired
              description
            }
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
  ) {
    createRigInspection(input: {
      attributes: {
        dropzoneId: $dropzoneId,
        rigId: $rigId,
      }
    }) {
      rigInspection {
        id
        inspectedBy {
          id
          name
        }
        rig {
          id
        }
        checklistValues {
          id
          value
          checklistItem {
            id
            name
            valueType
            isRequired
            description
          }
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



const MUTATION_SET_VALUE = gql`
  mutation SetValue(
    $checklistItemId: Int,
    $rigInspectionId: Int,
    $value: String,
  ) {
    updateChecklistValue(input: {
      attributes: {
        checklistItemId: $checklistItemId,
        rigInspectionId: $rigInspectionId,
        value: $value
      }
    }) {
      checklistValue {
        id,
        value,
        checklistItem {
          id
          name
          valueType,
          description
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
  const { global: globalState, rigInspectionForm: state } = useAppSelector(state => state);
  const dispatch = useAppDispatch();
  const route = useRoute<{ key: string, name: string, params: { rig: Rig, dropzoneUserId: number }}>();
  const { rig, dropzoneUserId } = route.params;
  const { data, loading } = useQuery<Query>(QUERY_RIG_INSPECTIONS, {
    variables: {
      dropzoneId: Number(globalState.currentDropzone!.id),
      dropzoneUserId: dropzoneUserId,
    }
  });

  const canInspect = useRestriction("actAsRigInspector");
  const [mutationCreateRigInspection] = useMutation<Mutation>(MUTATION_CREATE_RIG_INSPECTION);
  const [mutationSetValue] = useMutation<Mutation>(MUTATION_SET_VALUE);

  React.useEffect(() => {
    if (data?.dropzone?.dropzoneUser?.rigInspections?.some((inspection) => inspection.rig?.id.toString() === rig.id.toString())) {
      const inspection = data?.dropzone?.dropzoneUser?.rigInspections?.find((inspection) => inspection.rig?.id === rig.id);
      console.log({ inspection });
      dispatch(
        rigInspectionForm.setOriginal(
          inspection!
        )
      )
    }
  }, [JSON.stringify(data?.dropzone?.dropzoneUser?.rigInspections)]);

  const createRigInspection = React.useCallback(async () => {
    try {
      let rigInspectionId = state.original?.id;
      if (!rigInspectionId) {
        const result = await mutationCreateRigInspection({
          variables: { dropzoneId: Number(globalState.currentDropzone!.id), rigId: Number(rig.id) }
        });

        rigInspectionId = result?.data?.createRigInspection?.rigInspection!.id;
      }

      await Promise.all(
        state.fields.map((field) =>
          mutationSetValue({
            variables: {
              rigInspectionId: Number(rigInspectionId),
              checklistItemId: Number(field.checklistItem.id),
              value: field.value
          }})
        )
      );
    } catch(error) {
      dispatch(snackbarActions.showSnackbar({ message: error.message, variant: "error" }));
    }
  }, [JSON.stringify(state.fields), state?.original?.id, globalState?.currentDropzone?.id]);

  return (
    <ScrollableScreen>
      <Card style={{ width: "100%"}}>
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
        <Card.Title title="Inspection" />

        <Card.Content>
          <RigInspectionForm />
        </Card.Content>

        <Card.Actions>
          <Button disabled={!canInspect} mode="contained" onPress={() => createRigInspection()} style={{ width: "100%"}}>
            Mark as inspected
          </Button>
        </Card.Actions>
      </Card>
    </ScrollableScreen>
  );
}

