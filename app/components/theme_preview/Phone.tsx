import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Surface } from 'react-native-paper';
import { useAppSelector } from '../../state';

interface IPhonePreview {
  primaryColor?: string;
}

function PhonePreview(props: IPhonePreview) {
  const { primaryColor } = props;
  const { theme, palette } = useAppSelector((root) => root.global);

  return (
    <View>
      <Surface style={styles.previewContainer}>
        <View style={[styles.previewAppBar, { backgroundColor: theme.colors.surface }]} />
        <View style={[styles.previewLoadCard]} />
        <View style={[styles.previewLoadCard2]} />
        <View style={[styles.previewLoadCard3]} />
        <View style={[styles.previewButton, { backgroundColor: primaryColor }]} />
        <View style={[styles.previewTabBar, { backgroundColor: theme.colors.surface }]} />
        <View style={[styles.previewTabButton, { backgroundColor: palette.placeholder }]} />
        <View style={[styles.previewTabButton2, { backgroundColor: palette.placeholder }]} />
        <View style={[styles.previewTabButton3, { backgroundColor: palette.placeholder }]} />
      </Surface>
      <Text style={styles.label}>Phone</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 8,
  },
  previewContainer: {
    height: 200,
    width: 100,
    borderRadius: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#CCCCCC',
    backgroundColor: '#EFEFEF',
    alignSelf: 'center',
  },
  previewTabButton: {
    width: 25,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: 'blue',
    position: 'absolute',
    bottom: 4,
    left: 30,
  },
  previewTabButton2: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: 'blue',
    position: 'absolute',
    bottom: 4,
    left: 59,
  },
  previewTabButton3: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: 'blue',
    position: 'absolute',
    bottom: 4,
    left: 70,
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
    width: '96%',
    borderRadius: 2,
    height: '20%',
    marginVertical: '2%',
    marginHorizontal: '2%',
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    top: '15%',
  },
  previewLoadCard2: {
    width: '96%',
    height: '20%',
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    marginVertical: '2%',
    marginHorizontal: '2%',
    position: 'absolute',
    top: '37%',
  },
  previewLoadCard3: {
    width: '96%',
    height: '20%',
    borderRadius: 2,
    marginVertical: '2%',
    backgroundColor: '#FFFFFF',
    marginHorizontal: '2%',
    position: 'absolute',
    top: '59%',
  },
  previewButton: {
    width: '35%',
    height: '6%',
    position: 'absolute',
    bottom: 22,
    right: 5,
    borderRadius: 5,
    backgroundColor: '#DDDDDD',
  },
  colorBox: {
    height: 25,
    width: 25,
    margin: 5,
  },
});

export default PhonePreview;
