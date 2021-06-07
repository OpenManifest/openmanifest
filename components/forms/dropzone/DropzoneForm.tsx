import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Button, TextInput, HelperText, Card, Menu, List, Portal, Modal, Dialog, Checkbox } from 'react-native-paper';
import { getDocumentAsync } from "expo-document-picker";
import { useQuery, gql } from '@apollo/client';
import { ColorPicker } from "react-native-color-picker";
import { actions, useAppSelector, useAppDispatch } from '../../../redux';
import SliderComponent from "@react-native-community/slider";

import { View } from '../../Themed';

import slice from "./slice";
import { Query } from '../../../graphql/schema';


const QUERY_FEDERATIONS = gql`
  query QueryFederations {
    federations {
      id
      name
    }
  }
`;
export default function DropzoneForm() {
  const global = useAppSelector(state => state.global);
  const state = useAppSelector(state => state.forms.dropzone);
  const dispatch = useAppDispatch();
  const { data, loading } = useQuery<Query>(QUERY_FEDERATIONS);
  const [federationMenuOpen, setFederationMenuOpen] = React.useState(false);
  const [colorPicker, setColorPicker] = React.useState<"primary" | "secondary" | null>(null);

  React.useEffect(() => {
    if (data?.federations?.length && !state.fields.federation?.value) {
      dispatch(
        actions.forms.dropzone.setField(["federation", data.federations[0]])
      );
    }
  }, [JSON.stringify(data?.federations)]);

  const onPickImage = React.useCallback(
    async () => {
      try {
        const result = await getDocumentAsync({
          multiple: false,
          type: "image",
        }) as { uri: string };

        dispatch(actions.forms.dropzone.setField(["banner", result.uri as string]));
      } catch (e) {
        console.log(e);
      }
    },
    [dispatch],
  )

  return (
    <>
      <Portal>
        <Dialog
          visible={!!colorPicker}
          onDismiss={() => setColorPicker(null)}
        >
            <Dialog.Title>Pick a {colorPicker === "primary" ? "primary color" : "secondary color"}</Dialog.Title>
            <Dialog.Content style={{ padding: 20, height: 400 }}>
              <ColorPicker
                onColorSelected={color => {
                dispatch(
                  colorPicker === "primary"
                    ? actions.forms.dropzone.setField(["primaryColor", color])
                    : actions.forms.dropzone.setField(["secondaryColor", color])
                )
                }}
                style={{ flex: 1 }}
                sliderComponent={SliderComponent as any}
                defaultColor={(colorPicker === "primary" ? state.fields.primaryColor.value : state.fields.secondaryColor.value) || undefined}
                hideSliders
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setColorPicker(null)}>Cancel</Button>
              <Button
                disabled={
                  (colorPicker === "primary" && !state.fields.primaryColor.value) ||
                  (colorPicker === "secondary" && !state.fields.secondaryColor.value)
                }
                onPress={() => {
                  console.log({
                    current: global.theme.colors.accent,
                    next: state.fields.secondaryColor.value
                  })
                  if (colorPicker === "primary") {
                    dispatch(
                      actions.global.setPrimaryColor(state.fields.primaryColor.value!),
                    );
                  } else {
                    dispatch(
                      actions.global.setAccentColor(state.fields.secondaryColor.value!),
                    );
                  }
                  setColorPicker(null);
                }}
              >
                Save
              </Button>
            </Dialog.Actions>
          </Dialog>
      </Portal>
      <Card style={{ width: "100%", maxHeight: 300, marginVertical: 16 }}>
        <Card.Cover
          source={{ uri: state.fields.banner.value || 'https://picsum.photos/700' }}
          resizeMode="cover"
        />
        <Card.Actions style={{ justifyContent: "flex-end" }}>
          <Button onPress={onPickImage}>Upload</Button>
        </Card.Actions>
      </Card>
      <Card style={{ width: "100%", marginVertical: 16, paddingHorizontal: 16 }}>
        <List.Subheader style={styles.subheader}>Dropzone</List.Subheader>
        <TextInput
          style={styles.field}
          mode="outlined"
          label="Name"
          error={!!state.fields.name.error}
          value={state.fields.name.value || ""}
          onChangeText={(newValue) => dispatch(actions.forms.dropzone.setField(["name", newValue]))}
        />
        <HelperText type="error">
          { state.fields.name.error || "" }
        </HelperText>

        

        <List.Subheader style={styles.subheader}>Federation</List.Subheader>
        
        <Menu
          onDismiss={() => setFederationMenuOpen(false)}
          visible={federationMenuOpen}
          anchor={
            <Menu.Item
              onPress={() => setFederationMenuOpen(true)}
              title={state.fields?.federation?.value?.name || ""}
              icon="parachute"
            />}>
          {
            data?.federations?.map((federation) =>
              <Menu.Item
                key={`federation-select-${federation.id}`}
                title={federation.name}
                onPress={() => {
                  dispatch(actions.forms.dropzone.setField(["federation", federation]));
                  setFederationMenuOpen(false);
                }}
              />
            )
          }
        </Menu>
        <HelperText type="error">
          { state.fields.federation.error || "" }
        </HelperText>
        <List.Subheader style={styles.subheader}>Branding</List.Subheader>
        <List.Item
          title="Primary color"
          onPress={() => setColorPicker("primary")}
          left={() =>
            <View
              style={{
                width: 24,
                height: 24,
                backgroundColor: global.theme.colors.primary
              }}
            />
        }/>

        <List.Item
          title="Secondary color"
          onPress={() => setColorPicker("secondary")}
          left={() =>
            <View
              style={{
                width: 24,
                height: 24,
                backgroundColor: global.theme.colors.accent
              }}
            />
          }
        />

        <List.Item
          title="Use credit system"
          description="Users will be charged credits when a load is marked as landed and can't manifest with insufficient funds."
          onPress={() =>
            dispatch(actions.forms.dropzone.setField(["isCreditSystemEnabled", !state.fields.isCreditSystemEnabled.value]))
          }
          left={() =>
            <Checkbox
              onPress={() =>
                dispatch(actions.forms.dropzone.setField(["isCreditSystemEnabled", !state.fields.isCreditSystemEnabled.value]))
              }
              status={state.fields.isCreditSystemEnabled.value
                  ? "checked"
                  : "unchecked"
              }
            />
          }
        />

        <List.Item
          title="Public"
          description="Your dropzone will not be available in the app if this is disabled"
          onPress={() =>
            dispatch(actions.forms.dropzone.setField(["isPublic", !state.fields.isPublic.value]))
          }
          left={() =>
            <Checkbox
              onPress={() =>
                dispatch(actions.forms.dropzone.setField(["isPublic", !state.fields.isPublic.value]))
              }
              status={state.fields.isPublic.value
                  ? "checked"
                  : "unchecked"
              }
            />
        }/>
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  fields: {
    flexGrow: 1,
    display: "flex",
    width: "100%",
  },
  field: {
    marginBottom: 8,
    width: "100%",
  },
  subheader: {
    paddingLeft: 0
  }
});
