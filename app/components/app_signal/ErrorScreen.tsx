import * as React from 'react';
import { reloadAsync } from 'expo-updates';
import { Button, Card, HelperText } from 'react-native-paper';
import { Platform, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native-gesture-handler';
import LottieView from '../LottieView';
import ScreenContainer from '../layout/ScreenContainer';
import twigBreakAnimation from '../../../assets/images/error-twig-break.json';

interface IErrorScreenProps {
  error?: Error | null;
}
export default function ErrorScreen(props: IErrorScreenProps) {
  const { error } = props;
  const { t } = useTranslation('common');
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
      <Card style={styles.card}>
        <Card.Title
          title={t('errorScreen.title')}
          subtitle={t('errorScreen.subtitle')}
          titleStyle={{ textAlign: 'center' }}
          subtitleStyle={{ textAlign: 'center' }}
        />
        <Card.Content style={{ alignItems: 'center' }}>
          <LottieView
            source={twigBreakAnimation}
            autoPlay
            loop={false}
            style={{
              height: Platform.OS === 'web' ? 300 : 150,
              width: Platform.OS === 'web' ? 300 : 150,
            }}
          />
          {!error ? null : (
            <>
              <HelperText type="error">{error?.message}</HelperText>
              {isDetailsVisible ? (
                <ScrollView style={{ maxHeight: 300 }}>
                  <HelperText type="error">{error.stack}</HelperText>
                </ScrollView>
              ) : null}
            </>
          )}
        </Card.Content>
        <Card.Actions style={{ justifyContent: 'space-between' }}>
          <Button compact onPress={onToggleDetails}>
            {isDetailsVisible ? t('errorScreen.hideDetails') : t('errorScreen.showDetails')}
          </Button>
          <Button
            disabled={reloading}
            loading={reloading}
            compact
            mode="outlined"
            onPress={onReloadApp}
          >
            {t('errorScreen.reload')}
          </Button>
        </Card.Actions>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: { width: '100%', minHeight: 250, maxWidth: 450, marginHorizontal: 16 },
});
