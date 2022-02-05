import * as React from 'react';
import { StyleSheet, View, ImageBackground } from 'react-native';
import { Avatar, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/core';
import { DropzoneEssentialsFragment, DropzoneExtensiveFragment } from 'app/api/operations';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Color from 'color';
import { actions, useAppDispatch, useAppSelector } from '../../../state';

interface DropzoneCardProps {
  dropzone: DropzoneEssentialsFragment;
}
export default function DropzonesScreen(props: DropzoneCardProps) {
  const { dropzone } = props;
  const dispatch = useAppDispatch();
  const globalState = useAppSelector((root) => root.global);
  const navigation = useNavigation();

  const nameLines = dropzone?.name?.split(/\s/) || [];
  const lines = [
    nameLines.length > 2 ? nameLines[0] : null,
    nameLines.length > 2 ? nameLines[1] : nameLines[0],
    nameLines.length > 2 ? nameLines[2] : null,
    nameLines.length === 2 ? nameLines[1] : null,
  ];

  const backgroundColor = Color(dropzone?.primaryColor || '#ffffff')
    .desaturate(0.2)
    .lighten(0.1);
  const textColor = backgroundColor.lighten(0.35);

  return (
    <TouchableOpacity
      style={{ alignSelf: 'center' }}
      onPress={async () => {
        if (dropzone) {
          const shouldPushRoute = !!globalState.currentDropzoneId;
          dispatch(actions.global.setDropzone(dropzone as DropzoneExtensiveFragment));

          if (shouldPushRoute) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            navigation.replace('Authenticated', {
              screen: 'HomeScreen',
            });
          }
        }
      }}
    >
      {dropzone?.banner ? (
        <View style={styles.cardContainer}>
          <ImageBackground source={{ uri: dropzone?.banner as string }} style={styles.banner}>
            <Text style={styles.title} numberOfLines={1}>
              {dropzone.name}
            </Text>
          </ImageBackground>
        </View>
      ) : (
        <View
          style={[
            styles.cardContainer,
            {
              backgroundColor: backgroundColor.toString(),
            },
          ]}
        >
          <Avatar.Icon
            style={styles.icon}
            icon="airplane-takeoff"
            size={160}
            color={textColor.toString()}
          />
          <View style={styles.svgContainer}>
            {lines.map((substr) => (
              <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit allowFontScaling>
                {substr}
              </Text>
            ))}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    margin: 16,
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: 'hidden',
  },
  title: {
    fontStyle: 'italic',
    fontFamily: 'Roboto_700Bold_Italic',
    textAlign: 'center',
    fontSize: 26,
    color: 'white',
    overflow: 'visible',
    width: 160,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  svgContainer: {
    position: 'absolute',
    left: 0,
    alignSelf: 'center',
    justifyContent: 'center',
    top: 0,
    height: 180,
    width: '100%',
  },
  banner: {
    width: '100%',
    height: '100%',
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
