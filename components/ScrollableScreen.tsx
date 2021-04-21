import React, { useEffect, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, ScrollViewProps } from "react-native";


interface IScrollableScreen extends ScrollViewProps {
  children: React.ReactNode;
}
export default function ScrollableScreen(props: IScrollableScreen) {

  const [height, setHeight] = useState(Dimensions.get('window').height)

  useEffect(() => {
    Dimensions.addEventListener('change', ({ window }) => setHeight(window.height))
    return () => {
      Dimensions.removeEventListener('change', ({ window }) => setHeight(window.height))
    }
  }, []);

  return (
    <ScrollView style={[styles.container, { height }, props.style]} contentContainerStyle={[styles.content, props.contentContainerStyle]}>
      {props.children}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    alignItems: "center"
  }
})