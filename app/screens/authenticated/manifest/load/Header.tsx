import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import isAfter from 'date-fns/isAfter';
import { LinearGradient } from 'expo-linear-gradient';
import { LoadEssentialsFragment } from 'app/api/operations';
import { format } from 'date-fns/esm';
import parseISO from 'date-fns/parseISO';
import { DateTime } from 'luxon';
import Countdown from '../manifest/LoadCard/Countdown';
import { Icon, Text, useTheme } from 'app/ui';

interface ILoadHeader {
  load?: LoadEssentialsFragment;
  children?: React.ReactNode;
  renderBadges?: React.ComponentType<object>;
}
export default function UserHeader(props: ILoadHeader) {
  const { load, renderBadges: RenderBadges, children } = props;
  const theme = useTheme();
  const { t } = useTranslation(['common', 'terms']);
  const { width } = useWindowDimensions();

  return (
    <LinearGradient
      start={{ x: 0.0, y: 0.25 }}
      end={{ x: 0.5, y: 1.0 }}
      style={styles.container}
      colors={[theme.colour.surface, theme.colour.surface]}
    >
      <View style={styles.avatarContainer}>
        <View style={{ flex: 1 / 3, alignItems: 'center', justifyContent: 'center' }}>
          {load?.dispatchAt &&
          typeof load.dispatchAt === 'number' &&
          DateTime.fromSeconds(load.dispatchAt) > DateTime.local() ? (
            <Countdown
              end={new Date(load.dispatchAt * 1000)}
              variant={theme.isDark ? 'light' : 'dark'}
              size={80}
            />
          ) : (
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: theme.radius.pill,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.colour.brandSoft,
              }}
            >
              <Icon name="account-tie-hat" size={48} tone="onBrandSoft" />
            </View>
          )}
        </View>
        <View style={styles.titleContainer}>
          <Text variant="title" role="heading">
            {t('common:loadNumber', {
              load: t('terms:load', { count: 1 }),
              number: load?.loadNumber,
            })}
          </Text>
          <Text>{load?.createdAt && format(parseISO(load.createdAt), 'dd LLLL, yyyy')}</Text>
          {RenderBadges && width > 600 ? <RenderBadges /> : <Text>{load?.name}</Text>}
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
    paddingHorizontal: 8,
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
});
