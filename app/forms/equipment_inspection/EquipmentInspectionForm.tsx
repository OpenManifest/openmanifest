import * as React from 'react';
import { Control, useFormState, useWatch } from 'react-hook-form';

import EquipmentInspectionItem from '../equipment_inspection_template/EquipmentInspectionItem';
import { FieldItem } from '../equipment_inspection_template/fieldItem';
import { EquipmentInspectionFields } from './useForm';
import { FieldError } from 'app/ui';

export interface IEquipmentInspectionFormProps {
  control: Control<EquipmentInspectionFields>;
  onChangeField(index: number, item: FieldItem): void;
}

export default function EquipmentInspectionForm(props: IEquipmentInspectionFormProps) {
  const { control, onChangeField } = props;
  const fields = useWatch({ control, name: 'fields' }) || [];
  const { errors } = useFormState({ control });
  const fieldErrors = errors.fields as unknown as ({ value?: { message?: string } } | undefined)[];

  return (
    <>
      {fields.map((item, index) => {
        return (
          <React.Fragment key={`field-${index}`}>
            <EquipmentInspectionItem
              config={item}
              value={item?.value || ''}
              onChange={(value) => onChangeField(index, value)}
            />
            {fieldErrors?.[index]?.value?.message ? (
              <FieldError>{fieldErrors[index]?.value?.message}</FieldError>
            ) : null}
          </React.Fragment>
        );
      })}
    </>
  );
}
