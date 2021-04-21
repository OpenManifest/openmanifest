import React, { useState } from "react";
import { Appbar, Menu, Paragraph, Text, Button } from "react-native-paper";
import { StackHeaderProps } from "@react-navigation/stack";
import { useQuery, gql } from "@apollo/client";
import { Dropzone, Query } from "../graphql/schema";
import { globalActions, useAppDispatch, useAppSelector } from "../redux";
import { View, StyleSheet } from "react-native";

const QUERY_DROPZONES = gql`
  query QueryDropzonesCompact {
    dropzones {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;


function AppBar({ navigation, previous, scene }: StackHeaderProps) {
  const [dropzoneMenuOpen, setDropzoneMenuOpen] = useState(false);
  const { data } = useQuery<Query>(QUERY_DROPZONES);
  const { currentDropzone, theme } = useAppSelector(state => state.global);
  const dispatch = useAppDispatch();
  
  const hasRig = !!currentDropzone?.currentUser?.user?.rigs?.length;
  const hasExitWeight = !!currentDropzone?.currentUser?.user?.exitWeight;

  const showSetupWarning = !hasRig || !hasExitWeight;

  return (
    <>
    <Appbar.Header>
      {previous ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
      <Appbar.Content title={scene.descriptor.options.title} />
      <Menu
        onDismiss={() => setDropzoneMenuOpen(false)}
        visible={dropzoneMenuOpen}
        anchor={
          <Text
            onPress={() => setDropzoneMenuOpen(true)}
            style={{ color: "white", marginRight: 8 }}
          >
            {currentDropzone?.name}
          </Text>
      }>
        {
          data?.dropzones?.edges?.map((edge) =>
            <Menu.Item
              title={edge?.node?.name}
              onPress={() => {
                dispatch(globalActions.setDropzone(edge?.node as Dropzone));
                setDropzoneMenuOpen(false);
              }}
            />
          )
        }
      </Menu>
    </Appbar.Header>
    { showSetupWarning && (
      <View style={styles.warning}>
        <Paragraph>
          You need to complete your profile
        </Paragraph>
        <Button color="black" mode="outlined" onPress={() => navigation.navigate("Profile")}>
          Take me there
        </Button>
      </View>
    )}
    </>
  );
}

const styles = StyleSheet.create({
  warning: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    width: "100%",
    backgroundColor: "#ffbb33",
    justifyContent: "space-between",
    paddingHorizontal: 32
  },
})

export default AppBar;