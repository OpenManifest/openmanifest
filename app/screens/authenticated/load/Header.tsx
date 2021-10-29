import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, IconButton, Paragraph, Title } from 'react-native-paper';

import isAfter from 'date-fns/isAfter';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppSelector } from '../../../state';
import { Load } from '../../../api/schema';
import Countdown from '../manifest/LoadCard/Countdown';

interface ILoadHeader {
  load?: Load;
  canEdit?: boolean;
  children?: React.ReactNode;
  onEdit?(): void;
}
export default function UserHeader(props: ILoadHeader) {
  const { load, onEdit, canEdit, children } = props;
  const { theme, palette } = useAppSelector((root) => root.global);
  return (
    <LinearGradient
      start={{ x: 0.0, y: 0.25 }}
      end={{ x: 0.5, y: 1.0 }}
      style={styles.container}
      colors={[theme.colors.surface, theme.colors.surface]}
    >
      <View style={styles.actions}>
        {!canEdit ? null : (
          <IconButton
            icon="pencil"
            size={20}
            color={theme.colors.surface}
            onPress={() => (onEdit ? onEdit() : null)}
          />
        )}
      </View>
      <View style={styles.avatarContainer}>
        <View style={{ flex: 1 / 3 }}>
          {load?.dispatchAt && isAfter(load.dispatchAt * 1000, new Date()) ? (
            <Countdown end={new Date(load.dispatchAt * 1000)} variant="light" size={80} />
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
          <Paragraph style={styles.paragraph}>{load?.name}</Paragraph>
        </View>
      </View>

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