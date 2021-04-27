import * as React from 'react';
import { useAppSelector, useAppDispatch, rigInspectionForm } from '../../../redux';
import RigInspectionItem from '../rig_inspection_template/RigInspectionItem';



export default function RigInspectionForm() {
  const { rigInspectionForm: state } = useAppSelector(state => state);
  const dispatch = useAppDispatch();
  
  return ( 
    <>
      {
        state.fields.map((item, index) => {
          return (
            <RigInspectionItem
              config={item}
              value={item?.value || ""}
              onChange={(value) =>
                dispatch(
                  rigInspectionForm.setField([index, value])
                )
              }
            />
          )
        })
      }
    </>
  );
}
