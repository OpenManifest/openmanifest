import React from "react";
import { StyleSheet } from "react-native";
import { Paragraph, Title } from "react-native-paper";
import { View } from "./Themed";

export default function NoResults({ title, subtitle }: { title: string, subtitle: string}) {
  return (
    <View style={styles.empty}>
      <Title>{title}</Title>
      <Paragraph style={{ textAlign: "center" }}>
        {subtitle}
      </Paragraph>
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
    display: "flex"
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%"
  }
});