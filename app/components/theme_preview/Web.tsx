import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Surface } from 'react-native-paper';

interface IWebPreview {
  primaryColor?: string;
  secondaryColor?: string;
}

function WebPreview(props: IWebPreview) {
  const { primaryColor, secondaryColor } = props;

  return (
    <View>
      <Surface style={styles.previewContainer}>
        <View style={[styles.previewAppBar, { backgroundColor: primaryColor }]} />
        <View style={[styles.previewLoadCard]} />
        <View style={[styles.previewLoadCard2]} />
        <View style={[styles.previewLoadCard3]} />
        <View style={[styles.previewButton, { backgroundColor: secondaryColor }]} />
        <View style={[styles.previewTabBar, { backgroundColor: primaryColor }]} />
      </Surface>
      <Text style={styles.label}>Web</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
    fontSize: 16,
    marginTop: 8,
  },
  previewContainer: {
    height: 100,
    width: 170,
    borderRadius: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#CCCCCC',
    alignSelf: 'center',
  },

  previewAppBar: {
    width: '100%',
    height: '8.5%',
    backgroundColor: '#DDDDDD',
    position: 'absolute',
    top: 0,
    borderTopRightRadius: 5,
    borderTopLeftRadius: 5,
  },
  previewTabBar: {
    width: '100%',
    height: '8.5%',
    backgroundColor: '#DDDDDD',
    position: 'absolute',
    bottom: 0,
    borderBottomRightRadius: 5,
    borderBottomLeftRadius: 5,
  },
  previewLoadCard: {
    width: '30%',
    height: '60%',
    marginVertical: '2%',
    backgroundColor: '#DDDDDD',
    position: 'absolute',
    top: '15%',
    left: '2%',
  },
  previewLoadCard2: {
    width: '30%',
    height: '60%',
    backgroundColor: '#DDDDDD',
    marginVertical: '2%',
    position: 'absolute',
    top: '15%',
    left: '35%',
  },
  previewLoadCard3: {
    width: '30%',
    height: '60%',
    marginVertical: '2%',
    backgroundColor: '#DDDDDD',
    position: 'absolute',
    top: '15%',
    left: '68%',
  },
  previewButton: {
    width: '12%',
    height: '6%',
    position: 'absolute',
    bottom: 15,
    right: 8,
    borderRadius: 5,
    backgroundColor: '#DDDDDD',
  },
  colorBox: {
    height: 25,
    width: 25,
    margin: 5,
  },
});

export default WebPreview;
