import * as React from 'react';
import { StyleSheet } from 'react-native';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client';

import { useAppSelector, useAppDispatch, rigInspectionForm } from '../../../redux';

import slice from "./slice";
import { Query } from '../../../graphql/schema';
import RigInspectionItem from './RigInspectionItem';


const QUERY_RIG_INSPECTION = gql`
  query RigInspection($dropzoneId: Int!) {
    dropzone(id: $dropzoneId) {
      rigInspectionChecklist {
        checklistItems {
          id
          isRequired
          name
          valueType
          description
        }
      }
    }
  }
`;

export default function RigForm() {
  const { global: globalState, rigInspectionForm: state } = useAppSelector(state => state);

  const dispatch = useAppDispatch();
  const { data, loading } = useQuery<Query>(QUERY_RIG_INSPECTION, {
    variables: {
      dropzoneId: Number(globalState?.currentDropzone?.id)
    }
  });

  return ( 
    <>
      {
        data?.dropzone?.rigInspectionChecklist?.checklistItems?.map((item) => {
          const currentValue = state.fields.find((value) => value?.checklistItem.id === item.id);

          return (
            <RigInspectionItem
              config={item}
              value={currentValue?.value || ""}
              onChange={(value) =>
                dispatch(
                  rigInspectionForm.setItem({ checklistItem: item, value, id: currentValue?.id || null })
                )
              }
            />
          )
        })
      }
    </>
  );
}

const styles = StyleSheet.create({
  fields: {
    flex: 1,
  },
  field: {
    marginBottom: 8,
  }
});
