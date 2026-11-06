import * as React from 'react';
import { Button, Card } from 'react-native-paper';

import { useEquipmentInspectionTemplateQuery } from 'app/api/reflection';

import {
  EquipmentInspectionTemplateForm,
  useEquipmentInspectionTemplateForm,
} from 'app/forms/equipment_inspection_template';
import FormColumn from 'app/components/layout/FormColumn';
import ChipSelect from 'app/components/input/chip_select/ChipSelect';
import { useOperatorContext } from 'app/providers/operator/context';
import { Permission } from 'app/api/schema.d';
import useRestriction from 'app/hooks/useRestriction';
import { useWindowDimensions, View } from 'react-native';

export default function EquipmentInspectionTemplateScreen() {
  const { operator: currentOperator } = useOperatorContext();
  const { data } = useEquipmentInspectionTemplateQuery({
    variables: {
      operatorId: currentOperator?.operator?.id?.toString() as string,
    },
  });

  const canEdit = useRestriction(Permission.UpdateFormTemplate);
  // One form for each kind of equipment that is inspected
  const kinds = React.useMemo(
    () =>
      (data?.operator?.equipmentKinds ?? []).filter(
        (candidate) => candidate.inspectionFormTemplate
      ),
    [data?.operator?.equipmentKinds]
  );
  const [chosenKindId, setChosenKindId] = React.useState<string | null>(null);
  const kind = kinds.find((candidate) => candidate.id === chosenKindId) ?? kinds[0];
  const { control, loading, onSubmit } = useEquipmentInspectionTemplateForm({
    template: kind?.inspectionFormTemplate,
    operatorId: data?.operator?.id,
  });

  const { width } = useWindowDimensions();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <FormColumn style={{ marginTop: 16, width: width > 550 ? 550 : '100%' }}>
        <Card style={{ width: '100%' }}>
          <Card.Title title={`${kind?.name ?? ''} inspection form`.trim()} />

          <Card.Content>
            {kinds.length > 1 ? (
              <ChipSelect<(typeof kinds)[number]>
                items={kinds}
                renderItemLabel={(item) => item.name}
                value={kind ? [kind] : []}
                isSelected={(item) => item.id === kind?.id}
                onChange={([chosen]) => setChosenKindId(chosen?.id ?? null)}
              />
            ) : null}
            <EquipmentInspectionTemplateForm {...{ control }} />
          </Card.Content>
        </Card>
        <Button
          disabled={!canEdit}
          mode="contained"
          loading={loading}
          onPress={onSubmit}
          style={{ width: '100%', marginTop: 16, borderRadius: 20 }}
        >
          Save template
        </Button>
      </FormColumn>
    </View>
  );
}
