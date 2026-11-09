import * as React from 'react';
import { Control, useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button, Divider, IconButton, Menu, Overlay, Row, Stack, Switch, TextField } from 'app/ui';
import { FieldItem } from './fieldItem';
import EquipmentInspectionItem from './EquipmentInspectionItem';
import { EquipmentInspectionTemplateFields } from './useForm';

export interface IEquipmentInspectionTemplateFormProps {
  control: Control<EquipmentInspectionTemplateFields>;
}

export default function EquipmentInspectionTemplateForm(
  props: IEquipmentInspectionTemplateFormProps
) {
  const { t } = useTranslation('common');
  const { control } = props;
  const { fields, append, update, remove } = useFieldArray({
    control,
    name: 'fields',
    keyName: 'key',
  });
  const [newItem, setNewItem] = React.useState<(Partial<FieldItem> & { index?: number }) | null>(
    null
  );

  const save = () => {
    const { index, ...item } = newItem || {};
    if (index !== undefined) {
      // If an index was provided, replace the existing field at that index
      update(index, item as FieldItem);
    } else {
      append(item as FieldItem);
    }
    setNewItem(null);
  };

  return (
    <Stack gap="md">
      {fields.map(({ key, ...item }, index) => (
        <React.Fragment key={key}>
          <Row align="center" gap="xs">
            <Stack flex>
              <EquipmentInspectionItem
                config={item}
                value={item?.value || ''}
                onChange={() => null}
              />
            </Stack>
            <IconButton
              icon="pencil"
              aria-label={t('forms.equipment_inspection_template.edit', { label: item.label })}
              onPress={() => setNewItem({ ...item, index })}
            />
            <IconButton
              icon="minus-circle"
              aria-label={t('forms.equipment_inspection_template.remove', { label: item.label })}
              onPress={() => remove(index)}
            />
          </Row>
          <Divider />
        </React.Fragment>
      ))}

      <Menu
        label={t('forms.equipment_inspection_template.addField')}
        trigger={
          <Button
            label={t('forms.equipment_inspection_template.addField')}
            icon="plus"
            variant="secondary"
          />
        }
        items={[
          {
            icon: 'pencil',
            label: t('forms.equipment_inspection_template.text'),
            onPress: () => setNewItem({ valueType: 'string' }),
          },
          {
            icon: 'calendar',
            label: t('forms.equipment_inspection_template.date'),
            onPress: () => setNewItem({ valueType: 'date' }),
          },
          {
            icon: 'counter',
            label: t('forms.equipment_inspection_template.number'),
            onPress: () => setNewItem({ valueType: 'integer' }),
          },
          {
            icon: 'checkbox-marked-circle-outline',
            label: t('forms.equipment_inspection_template.checkbox'),
            onPress: () => setNewItem({ valueType: 'boolean' }),
          },
        ]}
      />

      <Overlay
        open={!!newItem}
        onClose={() => setNewItem(null)}
        presentation="dialog"
        testID="field-dialog"
        title={t('forms.equipment_inspection_template.newField')}
        footer={
          <Row gap="sm" justify="end">
            <Button label={t('forms.cancel')} variant="tertiary" onPress={() => setNewItem(null)} />
            <Button label={t('forms.save')} onPress={save} />
          </Row>
        }
      >
        <Stack gap="md">
          <TextField
            label={t('forms.fields.name')}
            value={newItem?.label}
            onChange={(text) => setNewItem({ ...newItem, label: text })}
          />
          <TextField
            label={t('forms.fields.description')}
            placeholder={t('forms.equipment_inspection_template.optional')}
            value={newItem?.description}
            onChange={(text) => setNewItem({ ...newItem, description: text })}
          />
          <Switch
            label={t('forms.equipment_inspection_template.thisIsARequiredField')}
            value={!!newItem?.isRequired}
            onChange={(checked) => setNewItem({ ...newItem, isRequired: checked })}
          />
        </Stack>
      </Overlay>
    </Stack>
  );
}
