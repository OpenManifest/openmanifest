import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Button, TextInput, HelperText, Card, Menu, List, Portal, Modal, Dialog, Checkbox } from 'react-native-paper';
import { getDocumentAsync } from "expo-document-picker";
import { useQuery, gql } from '@apollo/client';
import ColorPicker from "../../input/colorpicker";
import { actions, useAppSelector, useAppDispatch } from '../../../redux';
import SliderComponent from "@react-native-community/slider";

import { View } from '../../Themed';

import slice from "./slice";
import { Query } from '../../../graphql/schema';
import { PhonePreview, WebPreview } from '../../theme_preview';
import FederationSelect from '../../input/dropdown_select/FederationSelect';


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
      <Card style={{ width: "100%", maxHeight: 300, marginVertical: 16 }}>
        <Card.Title title="Banner" />
        <Card.Cover
          source={{ uri: state.fields.banner.value || 'https://picsum.photos/700' }}
          resizeMode="cover"
        />
        <Card.Actions style={{ justifyContent: "flex-end" }}>
          <Button onPress={onPickImage}>Upload</Button>
        </Card.Actions>
      </Card>
      <Card style={styles.card}>
        <List.Subheader>Name</List.Subheader>
        <TextInput
          mode="outlined"
          error={!!state.fields.name.error}
          value={state.fields.name.value || ""}
          onChangeText={(newValue) => dispatch(actions.forms.dropzone.setField(["name", newValue]))}
        />
        <HelperText type="error">
          { state.fields.name.error || "" }
        </HelperText>
        <FederationSelect
          value={state.fields.federation.value}
          onSelect={(value) => dispatch(actions.forms.dropzone.setField(["federation", value]))}
          required
        />
        <HelperText type={!!state.fields.federation.error ? "error" : "info"}>
          { state.fields.federation.error || "" }
        </HelperText>
      </Card>
        

      
      <Card style={styles.card}>
        <Card.Title title="Branding" />
        <Card.Content style={{ flexDirection: "row", justifyContent: "space-evenly", alignItems: "flex-end", width: "100%" }}>
        <PhonePreview
          primaryColor={state.fields.primaryColor.value}
          secondaryColor={state.fields.secondaryColor.value}
        />

        <WebPreview
          primaryColor={state.fields.primaryColor.value}
          secondaryColor={state.fields.secondaryColor.value}
        />
        </Card.Content>
      </Card>
        
      <ColorPicker
        title="Primary color"
        helperText="Primary color is used for elements like the title bar and the tab bar"
        error={state.fields.primaryColor.error}
        onChange={(color) => dispatch(actions.forms.dropzone.setField(["primaryColor", color]))}
        value={state.fields.primaryColor.value}
      />

      <ColorPicker
        title="Accent color"
        helperText="Accent color is used for highlights, like buttons and loading bars"
        error={state.fields.secondaryColor.error}
        onChange={(color) => dispatch(actions.forms.dropzone.setField(["secondaryColor", color]))}
        value={state.fields.secondaryColor.value}
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
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginVertical: 16,
    width: "100%"
  },
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
