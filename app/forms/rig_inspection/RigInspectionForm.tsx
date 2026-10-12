import * as React from 'react';
import { Control, useFormState, useWatch } from 'react-hook-form';

import RigInspectionItem from '../rig_inspection_template/RigInspectionItem';
import { FieldItem } from '../rig_inspection_template/fieldItem';
import { RigInspectionFields } from './useForm';
import { FieldError } from 'app/ui';

export interface IRigInspectionFormProps {
  control: Control<RigInspectionFields>;
  onChangeField(index: number, item: FieldItem): void;
}

export default function RigInspectionForm(props: IRigInspectionFormProps) {
  const { control, onChangeField } = props;
  const fields = useWatch({ control, name: 'fields' }) || [];
  const { errors } = useFormState({ control });
  const fieldErrors = errors.fields as unknown as ({ value?: { message?: string } } | undefined)[];

  return (
    <>
      {fields.map((item, index) => {
        return (
          <React.Fragment key={`field-${index}`}>
            <RigInspectionItem
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
