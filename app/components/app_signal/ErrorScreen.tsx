import * as React from 'react';
import { reloadAsync } from 'expo-updates';
import { Platform, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native-gesture-handler';
import LottieView from '../LottieView';
import ScreenContainer from '../layout/ScreenContainer';
import twigBreakAnimation from '../../../assets/images/error-twig-break.json';
import { Button, Card, Row, Stack, Text, useTheme } from 'app/ui';

interface IErrorScreenProps {
  error?: Error | null;
}
export default function ErrorScreen(props: IErrorScreenProps) {
  const { error } = props;
  const { t } = useTranslation('common');
  const theme = useTheme();
  const [isDetailsVisible, setDetailsVisible] = React.useState(false);
  const [reloading, setReloading] = React.useState(false);
  const onToggleDetails = React.useCallback(
    () => setDetailsVisible(!isDetailsVisible),
    [isDetailsVisible]
  );

  const onReloadApp = React.useCallback(async () => {
    try {
      setReloading(true);

      if (Platform.OS === 'web') {
        window.location.reload();
      } else {
        await reloadAsync();
      }
    } finally {
      setReloading(false);
    }
  }, []);

  return (
    <ScreenContainer style={styles.container}>
      <View style={[styles.card, { marginHorizontal: theme.space.lg }]}>
        <Card variant="raised">
          <Stack gap="md">
            <Stack gap="xs">
              <Text variant="title" role="heading" align="center">
                {t('errorScreen.title')}
              </Text>
              <Text tone="muted" align="center">
                {t('errorScreen.subtitle')}
              </Text>
            </Stack>
            <View style={{ alignItems: 'center' }}>
              <LottieView
                source={twigBreakAnimation}
                autoPlay
                loop={false}
                style={{
                  height: Platform.OS === 'web' ? 300 : 150,
                  width: Platform.OS === 'web' ? 300 : 150,
                }}
              />
            </View>
            {!error ? null : (
              <>
                <Text variant="caption" tone="blocked">
                  {error?.message}
                </Text>
                {isDetailsVisible ? (
                  <ScrollView style={{ maxHeight: 300 }}>
                    <Text variant="caption" tone="blocked">
                      {error.stack}
                    </Text>
                  </ScrollView>
                ) : null}
              </>
            )}
            <Row justify="between" gap="sm">
              <Button
                variant="tertiary"
                label={
                  isDetailsVisible ? t('errorScreen.hideDetails') : t('errorScreen.showDetails')
                }
                onPress={onToggleDetails}
              />
              <Button
                variant="secondary"
                disabled={reloading}
                loading={reloading}
                label={t('errorScreen.reload')}
                onPress={onReloadApp}
              />
            </Row>
          </Stack>
        </Card>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: { width: '100%', maxWidth: 450 },
});
