import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import * as React from 'react';
import { useController } from 'react-hook-form';
import { Button, Card, Checkbox, Divider, Paragraph } from 'react-native-paper';
import { View } from 'react-native';
import { useRigInspectionTemplateQuery } from 'app/api/reflection';
import { RigInspectionForm, useRigInspectionForm } from 'app/forms/rig_inspection';
import { parseFields, FieldItem } from 'app/forms/rig_inspection_template';
import { useDropzoneContext } from 'app/providers/dropzone/context';
import { Permission } from 'app/api/schema.d';
import useRestriction from 'app/hooks/useRestriction';
import { useUserProfile } from 'app/api/crud';
import FormColumn from 'app/components/layout/FormColumn';
import ScreenContainer from 'app/components/layout/ScreenContainer';
import RigCard from '../equipment/RigCard';

export type RigInspectionRoute = {
  RigInspectionScreen: {
    rigId: string;
    dropzoneUserId: string;
  };
};
export default function RigInspectionScreen() {
  const { dropzone: currentDropzone } = useDropzoneContext();
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
  const template = rigInspectionQuery?.dropzone?.rigInspectionTemplate;

  const rig = React.useMemo(
    () => dropzoneUser?.user?.rigs?.find(({ id }) => id === rigId),
    [dropzoneUser?.user?.rigs, rigId]
  );

  // An earlier inspection of this rig is shown as it was filled in; otherwise the dropzone's template is
  const existingInspection = React.useMemo(
    () =>
      dropzoneUser?.rigInspections?.find(
        (inspection) =>
          inspection.rig?.id?.toString() === rig?.id?.toString() && inspection.definition
      ),
    [dropzoneUser?.rigInspections, rig?.id]
  );
  const fields = React.useMemo(
    () => parseFields(existingInspection?.definition ?? template?.definition),
    [existingInspection?.definition, template?.definition]
  );

  const canInspect = useRestriction(Permission.ActAsRigInspector);
  const navigation = useNavigation();
  const { control, setValue, loading, onSubmit, formState } = useRigInspectionForm({
    fields,
    ok: !!existingInspection?.isOk,
    rigId: rig?.id,
    dropzoneId: currentDropzone?.dropzone?.id,
    onSuccess: navigation.goBack,
  });
  const { field: ok } = useController({ name: 'ok', control });

  const onChangeField = React.useCallback(
    (index: number, item: FieldItem) =>
      setValue(`fields.${index}`, item, { shouldDirty: true, shouldValidate: true }),
    [setValue]
  );

  return (
    <ScreenContainer edges={['bottom']}>
      <FormColumn>
        {rig && <RigCard {...{ rig }} />}

        <Card style={{ width: '100%' }}>
          <Card.Title title={template?.name} />

          <Card.Content>
            {canInspect ? null : (
              <Paragraph>
                You need Rig Inspector permissions to update this form, but you can still view it.
              </Paragraph>
            )}
            <View style={{ flex: 1, flexGrow: 1, opacity: canInspect ? 1.0 : 0.6 }}>
              <RigInspectionForm {...{ control, onChangeField }} />
            </View>

            <Divider />
            <Checkbox.Item
              mode="android"
              label="This rig is OK to jump"
              onPress={() => ok.onChange(!ok.value)}
              status={ok.value ? 'checked' : 'unchecked'}
            />
          </Card.Content>

          <Card.Actions>
            <Button
              disabled={!canInspect || (!formState.isDirty && !existingInspection)}
              mode="contained"
              onPress={onSubmit}
              loading={loading}
              style={{ width: '100%' }}
            >
              Mark as inspected
            </Button>
          </Card.Actions>
        </Card>
      </FormColumn>
    </ScreenContainer>
  );
}
