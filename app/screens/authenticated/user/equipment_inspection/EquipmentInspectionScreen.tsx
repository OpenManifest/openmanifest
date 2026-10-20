import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import * as React from 'react';
import { useController } from 'react-hook-form';
import { Button, Card, Checkbox, Divider, Paragraph } from 'react-native-paper';
import { View } from 'react-native';
import { useEquipmentInspectionTemplateQuery } from 'app/api/reflection';
import {
  EquipmentInspectionForm,
  useEquipmentInspectionForm,
} from 'app/forms/equipment_inspection';
import { parseFields, FieldItem } from 'app/forms/equipment_inspection_template';
import { useOperatorContext } from 'app/providers/operator/context';
import { Permission } from 'app/api/schema.d';
import useRestriction from 'app/hooks/useRestriction';
import { useUserProfile } from 'app/api/crud';
import FormColumn from 'app/components/layout/FormColumn';
import ScreenContainer from 'app/components/layout/ScreenContainer';
import EquipmentCard from '../equipment/EquipmentCard';

export type EquipmentInspectionRoute = {
  EquipmentInspectionScreen: {
    equipmentId: string;
    membershipId: string;
  };
};
export default function EquipmentInspectionScreen() {
  const { operator: currentOperator } = useOperatorContext();
  const route = useRoute<RouteProp<EquipmentInspectionRoute>>();
  const { equipmentId, membershipId } = route.params;
  const { membership } = useUserProfile({
    id: membershipId,
  });
  const { data: equipmentInspectionQuery } = useEquipmentInspectionTemplateQuery({
    variables: {
      operatorId: currentOperator?.operator?.id as string,
    },
    skip: !currentOperator?.operator?.id,
  });
  const equipment = React.useMemo(
    () => membership?.user?.equipment?.find(({ id }) => id === equipmentId),
    [membership?.user?.equipment, equipmentId]
  );
  // The form of the kind of equipment being inspected
  const template = equipmentInspectionQuery?.operator?.equipmentKinds?.find(
    (kind) => kind.id === equipment?.equipmentKind?.id
  )?.inspectionFormTemplate;

  // An earlier inspection of this equipment is shown as it was filled in; otherwise the operator's template is
  const existingInspection = React.useMemo(
    () =>
      membership?.equipmentInspections?.find(
        (inspection) =>
          inspection.equipment?.id?.toString() === equipment?.id?.toString() &&
          inspection.definition
      ),
    [membership?.equipmentInspections, equipment?.id]
  );
  const fields = React.useMemo(
    () => parseFields(existingInspection?.definition ?? template?.definition),
    [existingInspection?.definition, template?.definition]
  );

  const canInspect = useRestriction(Permission.ActAsEquipmentInspector);
  const navigation = useNavigation();
  const { control, setValue, loading, onSubmit, formState } = useEquipmentInspectionForm({
    fields,
    ok: !!existingInspection?.isOk,
    equipmentId: equipment?.id,
    operatorId: currentOperator?.operator?.id,
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
        {equipment && <EquipmentCard {...{ equipment }} />}

        <Card style={{ width: '100%' }}>
          <Card.Title title={template?.name} />

          <Card.Content>
            {canInspect ? null : (
              <Paragraph>
                You need Equipment Inspector permissions to update this form, but you can still view
                it.
              </Paragraph>
            )}
            <View style={{ flex: 1, flexGrow: 1, opacity: canInspect ? 1.0 : 0.6 }}>
              <EquipmentInspectionForm {...{ control, onChangeField }} />
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
