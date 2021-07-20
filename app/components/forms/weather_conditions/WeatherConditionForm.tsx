import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput, HelperText, Divider } from 'react-native-paper';
import { actions, useAppSelector, useAppDispatch } from '../../../redux';
import { set } from 'lodash';

import LicenseChipSelect from '../../input/chip_select/LicenseChipSelect';
import FederationSelect from '../../input/dropdown_select/FederationSelect';
import RoleSelect from '../../input/dropdown_select/RoleSelect';
export default function WeatherConditionsForm() {
  const state = useAppSelector(state => state.forms.weather);
  const dispatch = useAppDispatch();
  const { value: winds } = state.fields.winds;

  
  return ( 
    <>
    {winds.map((wind, index) => (
      <>
        <TextInput
          style={styles.field}
          mode="flat"
          label="Altitude"
          error={!!state.fields.winds.error}
          value={wind.altitude}
          onChangeText={(newValue) =>
            dispatch(
              actions.forms.weather.setField([
                "winds",
                set({...winds}, index, { ...wind, altitude: newValue })
              ])
            )
          }
        />
        
        <HelperText type={!!state.fields.winds.error ? "error" : "info"}>
          { state.fields.winds.error || " " }
        </HelperText>
        </>
    ))}
    </>
  );
  
}

const styles = StyleSheet.create({
  fields: {
    flex: 1,
    width: "100%",
    paddingTop: 32,
  },
  field: {
    marginBottom: 8,
    width: "100%",
  },
  ticketAddons: {
    marginBottom: 8
  }
});
