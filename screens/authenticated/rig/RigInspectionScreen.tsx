import { useMutation, useQuery } from '@apollo/client';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/core';
import { format } from 'date-fns';
import gql from 'graphql-tag';
import * as React from 'react';
import { Button, Card, Checkbox, Divider, List } from 'react-native-paper';
import RigInspectionForm from "../../../components/forms/rig_inspection/RigInspectionForm";
import ScrollableScreen from '../../../components/ScrollableScreen';
import { DropzoneUser, Mutation, Query, Rig } from '../../../graphql/schema';
import useRestriction from '../../../hooks/useRestriction';
import { rigInspectionForm, snackbarActions, useAppDispatch, useAppSelector } from '../../../redux';

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
            name
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
        inspectedBy {
          id
          name
        }
        rig {
          id
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
  const { global: globalState, rigInspectionForm: state } = useAppSelector(state => state);
  const dispatch = useAppDispatch();
  
  const route = useRoute<{ key: string, name: string, params: { rig: Rig, dropzoneUserId: number }}>();
  const { rig, dropzoneUserId } = route.params;
  const { data, loading, refetch } = useQuery<Query>(QUERY_RIG_INSPECTIONS, {
    variables: {
      dropzoneId: Number(globalState.currentDropzone!.id),
      dropzoneUserId: dropzoneUserId,
    }
  });

  const isFocused = useIsFocused();

  React.useEffect(() => {
    refetch();
  }, [isFocused])

  const canInspect = useRestriction("actAsRigInspector");
  const [mutationCreateRigInspection, mutation] = useMutation<Mutation>(MUTATION_CREATE_RIG_INSPECTION);
  const navigation = useNavigation();
  React.useEffect(() => {

    const hasExistingRigInspection = data?.dropzone?.dropzoneUser?.rigInspections?.some((inspection) => inspection.rig?.id.toString() === rig.id.toString() && inspection.definition);

    if (hasExistingRigInspection) {
      const inspection = data?.dropzone?.dropzoneUser?.rigInspections?.find((inspection) => inspection.rig?.id === rig.id);
      
      dispatch(
        rigInspectionForm.setFields(
          inspection!.definition || ""
        )
      );

      dispatch(
        rigInspectionForm.setOk(
          inspection!.isOk
        )
      );
    } else {
      dispatch(
        rigInspectionForm.setFields(
          data?.dropzone.rigInspectionTemplate?.definition!,
        )
      )
    }
  }, [JSON.stringify(data?.dropzone?.dropzoneUser?.rigInspections), data?.dropzone?.rigInspectionTemplate?.definition]);

  const createRigInspection = React.useCallback(async () => {
    try {
      const result = await mutationCreateRigInspection({
        variables: {
          dropzoneId: Number(globalState.currentDropzone!.id),
          rigId: Number(rig.id),
          definition: JSON.stringify(state.fields),
          isOk: !!state.ok,
        }
      });

      dispatch(
        snackbarActions.showSnackbar({ message: "Rig inspection saved", variant: "success" })
      );
      dispatch(rigInspectionForm.reset());
      navigation.goBack();

    } catch(error) {
      dispatch(snackbarActions.showSnackbar({ message: error.message, variant: "error" }));
    }
  }, [JSON.stringify(state.fields), state.ok, globalState?.currentDropzone?.id]);

  return (
    <ScrollableScreen>
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
            onPress={() => dispatch(rigInspectionForm.setOk(!state.ok))}
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
    </ScrollableScreen>
  );
}

