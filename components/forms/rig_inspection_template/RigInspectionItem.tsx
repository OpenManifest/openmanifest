import * as React from "react";
import { View } from "react-native";
import { Checkbox, HelperText, List, TextInput } from "react-native-paper";
import useRestriction from "../../../hooks/useRestriction";
import DatePicker from '../../input/date_picker/DatePicker';
import { FieldItem } from "./slice";

interface IFormItemItem {
  value: string | number | boolean;
  onChange(value: FieldItem): void;
  config: FieldItem;
}

export default function RigInspectionItem(props: IFormItemItem) {
  const canInspect = useRestriction("actAsRigInspector");

  if (props.config?.valueType && props.config?.valueType === "string") {
    return (
      <View style={{ flex: 1 }}>
        <TextInput
          mode="outlined"
          disabled={!canInspect}
          style={{ marginVertical: 8 }}
          value={props.value as string}
          onChangeText={(text) => props.onChange({ ...props.config, value: text})}
          label={props.config.label || ""}
        />
        <HelperText type="info">{props.config.description || "No description"}</HelperText>
      </View>
    )
  } else if (props.config?.valueType && props.config?.valueType === "boolean") {
    return (
      <List.Item
        title={props.config.label || ""}
        disabled={!canInspect}
        description={props.config.description}
        style={{ marginVertical: 8 }}
        right={() =>
          <Checkbox.Android
            status={
              !!props.value
                ? "checked"
                : "unchecked"
            }
          />
        }
        onPress={
          () => props.onChange({ ...props.config, value: !props.value as boolean})
        }
      />
    )
  } else if (props.config?.valueType && props.config?.valueType === "integer") {
    return (
      <View style={{ flex: 1 }}>
        <TextInput
          disabled={!canInspect}
          value={props.value as string}
          mode="outlined"
          onChangeText={(text) => props.onChange({ ...props.config, value: text as string })}
          label={props.config.label || ""}
          keyboardType="number-pad"
          style={{ marginVertical: 8 }}

        />
        <HelperText type="info">{props.config.description || "No description"}</HelperText>
      </View>
    )
  } else if (props.config?.valueType && props.config?.valueType === "date") {
    return (
      <View style={{ flex: 1 }}>
        <DatePicker
          disabled={!canInspect}
          timestamp={Number(props.value)}
          onChange={(time) => props.onChange({ ...props.config, value: time.toString() as string })}
          label={props.config.label || ""}
        />
        <HelperText type="info">{props.config.description || "No description"}</HelperText>
      </View>
    )
  }
  
  return null;
}