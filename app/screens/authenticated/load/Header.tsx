import * as React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Avatar, Paragraph, Title } from 'react-native-paper';

import isAfter from 'date-fns/isAfter';
import { LinearGradient } from 'expo-linear-gradient';
import { LoadEssentialsFragment } from 'app/api/operations';
import { useAppSelector } from 'app/state';
import Countdown from '../manifest/LoadCard/Countdown';

interface ILoadHeader {
  load?: LoadEssentialsFragment;
  children?: React.ReactNode;
  renderBadges?: React.ComponentType<object>;
}
export default function UserHeader(props: ILoadHeader) {
  const { load, renderBadges: RenderBadges, children } = props;
  const { theme, palette } = useAppSelector((root) => root.global);
  const { width } = useWindowDimensions();

  return (
    <LinearGradient
      start={{ x: 0.0, y: 0.25 }}
      end={{ x: 0.5, y: 1.0 }}
      style={styles.container}
      colors={[theme.colors.surface, theme.colors.surface]}
    >
      <View style={styles.avatarContainer}>
        <View style={{ flex: 1 / 3, alignItems: 'center', justifyContent: 'center' }}>
          {load?.dispatchAt && isAfter(load.dispatchAt * 1000, new Date()) ? (
            <Countdown
              end={new Date(load.dispatchAt * 1000)}
              variant={theme.dark ? 'light' : 'dark'}
              size={80}
            />
          ) : (
            <Avatar.Icon
              size={80}
              icon="shield-airplane"
              color={theme.dark ? theme.colors.text : palette.primary.dark}
              style={{ backgroundColor: theme.dark ? palette.primary.dark : palette.primary.light }}
            />
          )}
        </View>
        <View style={styles.titleContainer}>
          <Title style={styles.title}>Load #{load?.loadNumber}</Title>
          {RenderBadges && width > 600 ? (
            <RenderBadges />
          ) : (
            <Paragraph style={styles.paragraph}>{load?.name}</Paragraph>
          )}
        </View>
      </View>

      {RenderBadges && width < 600 ? <RenderBadges /> : null}

      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingTop: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 48,
    marginBottom: 32,
    marginTop: 32,
  },
  titleContainer: {
    paddingLeft: 8,
    fontWeight: 'bold',
    fontSize: 26,
    flex: 2 / 3,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  title: {},
  paragraph: {},
});
