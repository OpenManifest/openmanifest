import * as React from 'react';
import { actions, useAppSelector, useAppDispatch } from '../../../state';
import RigInspectionItem from '../rig_inspection_template/RigInspectionItem';

export default function RigInspectionForm() {
  const state = useAppSelector((root) => root.forms.rigInspection);
  const dispatch = useAppDispatch();

  return (
    <>
      {state.fields.map((item, index) => {
        return (
          <RigInspectionItem
            key={index}
            config={item}
            value={item?.value || ''}
            onChange={(value) => dispatch(actions.forms.rigInspection.setField([index, value]))}
          />
        );
      })}
    </>
  );
}
