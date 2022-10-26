import * as React from 'react';
import { reloadAsync } from 'expo-updates';
import { Button, Card, HelperText } from 'react-native-paper';
import { Platform, SafeAreaView, useWindowDimensions } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import LottieView from '../LottieView';
import twigBreakAnimation from '../../../assets/images/error-twig-break.json';

interface IErrorScreenProps {
  error?: Error | null;
}
export default function ErrorScreen(props: IErrorScreenProps) {
  const { error } = props;
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

  const { height, width } = useWindowDimensions();

  return (
    <SafeAreaView
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        height,
        width,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Card style={{ width: '100%', minHeight: 250, maxWidth: 450, marginHorizontal: 16 }}>
        <Card.Title
          title="That's a bug"
          subtitle="This error has been uploaded for review"
          titleStyle={{ textAlign: 'center' }}
          subtitleStyle={{ textAlign: 'center' }}
        />
        <Card.Content style={{ alignItems: 'center' }}>
          <LottieView
            // eslint-disable-next-line global-require
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
            {isDetailsVisible ? 'Hide' : 'Show'} details
          </Button>
          <Button
            disabled={reloading}
            loading={reloading}
            compact
            mode="outlined"
            onPress={onReloadApp}
          >
            Reload
          </Button>
        </Card.Actions>
      </Card>
    </SafeAreaView>
  );
}
