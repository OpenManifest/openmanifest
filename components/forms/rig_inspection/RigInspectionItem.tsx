import React from "react";
import { Checkbox, TextInput } from "react-native-paper";
import { ChecklistItem } from "../../../graphql/schema";
import useRestriction from "../../../hooks/useRestriction";
import DatePicker from '../../DatePicker';

interface IChecklistItem {
  value: string;
  onChange(value: string): void;
  config: ChecklistItem;
}

export default function RigInspectionItem(props: IChecklistItem) {

  const canInspect = useRestriction("actAsRigInspector");

  if (props.config?.valueType && props.config?.valueType === "string") {
    return (
      <TextInput
        mode="outlined"
        disabled={!canInspect}
        style={{ marginVertical: 8 }}
        value={props.value}
        onChangeText={(text) => props.onChange(text)}
        label={props.config.name || ""}
      />
    )
  } else if (props.config?.valueType && props.config?.valueType === "boolean") {
    return (
      <Checkbox.Item
        label={props.config.name || ""}
        disabled={!canInspect}
        style={{ marginVertical: 8 }}
        status={props.value === "true"
          ? "checked"
          : "unchecked"
        }
        onPress={
          () => props.onChange(props.value === "true" ? "false" : "true")
        }
      />
    )
  } else if (props.config?.valueType && props.config?.valueType === "integer") {
    return (
      <TextInput
        disabled={!canInspect}
        value={props.value}
        mode="outlined"
        onChangeText={(text) => props.onChange(text)}
        label={props.config.name || ""}
        keyboardType="number-pad"
        style={{ marginVertical: 8 }}
      />
    )
  } else if (props.config?.valueType && props.config?.valueType === "date") {
    return (
      <DatePicker
        disabled={!canInspect}
        timestamp={Number(props.value)}
        onChange={(time) => props.onChange(time.toString())}
        label={props.config.name || ""}
        
      />
    )
  }
  return null;
}