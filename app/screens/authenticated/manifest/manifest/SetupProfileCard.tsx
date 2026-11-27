import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import LottieView from 'app/components/LottieView';
import useProfileWizard from 'app/hooks/navigation/useProfileWizard';
import { Icon, Text, useTheme } from 'app/ui';
import PressableCard from './PressableCard';

export default function SetupProfileCard() {
  const openWizard = useProfileWizard();
  const theme = useTheme();
  const { t } = useTranslation(['common', 'terms']);
  const onPress = React.useCallback(() => openWizard(), [openWizard]);
  const title = t('common:legacy.setup.profile');

  return (
    <PressableCard
      label={title}
      onPress={onPress}
      style={{
        marginHorizontal: theme.space.lg,
        padding: theme.space.sm,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.space.md,
      }}
    >
      <LottieView
        style={{ height: 80, width: 80 }}
        autoPlay
        loop={false}
        source={require('../../../../../assets/images/profile2.json')}
      />
      <View style={{ flex: 1, gap: theme.space.xs }}>
        <Text variant="label">{title}</Text>
        <Text tone="muted">
          {t('common:legacy.setup.profileBody', {
            operator: t('terms:operator', { count: 1 }).toLowerCase(),
          })}
        </Text>
      </View>
      <Icon name="chevron-right" tone="muted" />
    </PressableCard>
  );
}
