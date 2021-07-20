import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { actions, useAppSelector, useAppDispatch } from '../../../redux';

import { FieldItem } from "./slice";
import RigInspectionItem from './RigInspectionItem';
import { Button, Checkbox, Dialog, Divider, FAB, IconButton, Portal, TextInput } from 'react-native-paper';




export default function RigInspectionTemplateForm() {
  const state = useAppSelector(state => state.forms.rigInspectionTemplate);
  const [newItem, setNewItem] = React.useState<Partial<FieldItem> & { index?: number } | null>(null);
  const [fabOpen, setFabOpen] = React.useState(false);

  const dispatch = useAppDispatch();
  

  return ( 
    <>
      {
        state.fields?.map((item, index) => {
          return (
            <>
              <View style={{ display: "flex", flexDirection: "row", alignItems: "center"}}>
                <View style={{ flexGrow: 1 }} onTouchEnd={() => setNewItem({ ...item, index })}>
                  <RigInspectionItem
                    config={item}
                    value={item?.value || ""}
                    onChange={() =>
                      null
                    }
                  />
                </View>
                <IconButton icon="delete" onPress={() => dispatch(actions.forms.rigInspectionTemplate.setFields(state.fields.filter((_, i) => i !== index)))} />
              </View>
              <Divider />
            </>
          )
        })
      }
      <Portal>
        <Dialog visible={!!newItem}>
          <Dialog.Title>New field</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Name"
              mode="outlined"
              value={newItem?.label}
              onChangeText={(text) => setNewItem({ ...newItem, label: text })}
            />

            <TextInput
              label="Description"
              placeholder="optional"
              mode="outlined"
              value={newItem?.description}
              onChangeText={(text) => setNewItem({ ...newItem, description: text })}
            />

            <Checkbox.Item
              label="This is a required field"
              mode="android"
              onPress={() => setNewItem({ ...newItem, isRequired: !newItem?.isRequired })}
              status={newItem?.isRequired ? "checked" : "unchecked"}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setNewItem(null)}>
              Cancel
            </Button>
            <Button
              onPress={() => {
                if (newItem?.index !== undefined) {
                  // If index was provided, replace existing field at that index
                  dispatch(actions.forms.rigInspectionTemplate.setFields(state.fields.map((field, idx) => idx === newItem.index ? newItem : field) as FieldItem[]));
                } else {
                  dispatch(actions.forms.rigInspectionTemplate.setFields([...state.fields, newItem as FieldItem]));
                }
                setNewItem(null);
              }}
            >
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
        <FAB.Group
          open={fabOpen}
          visible
          icon={fabOpen ? 'close' : 'plus'}
          actions={[
            { icon: 'pencil', label: "Text", onPress: () => setNewItem({ valueType: "string" }), },
            {
              icon: 'calendar',
              label: 'Date',
              onPress: () => setNewItem({ valueType: "date" }),
            },
            {
              icon: 'counter',
              label: 'Number',
              onPress: () => setNewItem({ valueType: "integer" }),
            },
            {
              icon: 'checkbox-marked-circle-outline',
              label: 'Checkbox',
              onPress: () => setNewItem({ valueType: "boolean" }),
            },
          ]}
          onStateChange={({ open }) => setFabOpen(open)}
        />
      </Portal>
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
