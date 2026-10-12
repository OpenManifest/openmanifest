import * as React from 'react';
import { StyleSheet, View, ImageBackground } from 'react-native';
import { Avatar, Text } from 'react-native-paper';
import { StackActions, useNavigation } from '@react-navigation/native';
import { OperatorEssentialsFragment } from 'app/api/operations';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Color from 'color';
import { useSession } from '../../../state';
import useSelectOperator from '../../../hooks/useSelectOperator';

/** Width of a card including its margin */
export const OPERATOR_CARD_SIZE = 160 + 2 * 16;

interface OperatorCardProps {
  operator: OperatorEssentialsFragment;
}
export default function OperatorsScreen(props: OperatorCardProps) {
  const { operator } = props;
  const currentOperatorId = useSession((session) => session.currentOperatorId);
  const selectOperator = useSelectOperator();
  const navigation = useNavigation();

  const nameLines = operator?.name?.split(/\s/) || [];
  const lines = [
    nameLines.length > 2 ? nameLines[0] : null,
    nameLines.length > 2 ? nameLines[1] : nameLines[0],
    nameLines.length > 2 ? nameLines[2] : null,
    nameLines.length === 2 ? nameLines[1] : null,
  ];

  const backgroundColor = Color(operator?.primaryColor || '#ffffff')
    .desaturate(0.2)
    .lighten(0.1);
  const textColor = backgroundColor.lighten(0.35);

  return (
    <TouchableOpacity
      style={{ alignSelf: 'center' }}
      onPress={async () => {
        if (operator) {
          const shouldPushRoute = !!currentOperatorId;
          const selected = await selectOperator(operator);

          if (selected && shouldPushRoute) {
            navigation.dispatch(
              StackActions.replace('Authenticated', {
                screen: 'LeftDrawer',
                params: {
                  screen: 'Manifest',
                  params: {
                    screen: 'ManifestScreen',
                  },
                },
              })
            );
          }
        }
      }}
    >
      {operator?.banner ? (
        <View style={styles.cardContainer}>
          <ImageBackground source={{ uri: operator?.banner as string }} style={styles.banner}>
            <Text
              style={styles.title}
              numberOfLines={1}
              ellipsizeMode="tail"
              accessibilityLabel={operator.name ?? undefined}
            >
              {operator.name}
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
    fontWeight: '700',
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
