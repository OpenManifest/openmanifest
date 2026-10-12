import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { IconButton, useTheme } from 'app/ui';

/** The round button over a map that centres it on where the person is */
export default function MyLocationButton({ onPress }: { onPress(): void }) {
  const { t } = useTranslation('common');
  const theme = useTheme();

  return (
    <View
      style={{
        position: 'absolute',
        bottom: theme.space.xxl,
        right: theme.space.xxl,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colour.surface,
        ...theme.elevation.raised,
      }}
    >
      <IconButton icon="crosshairs-gps" aria-label={t('location.useMine')} onPress={onPress} />
    </View>
  );
}
