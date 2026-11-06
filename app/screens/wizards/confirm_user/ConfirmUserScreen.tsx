import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from 'app/components/layout/ScreenContainer';
import { Icon, Text, useTheme } from 'app/ui';
import { useConfirmUserMutation } from '../../../api/reflection';
import { useSession } from '../../../state';

/** Opened from the link in the confirmation email: confirms the account with the link's token and signs the user in */
function ConfirmUserScreen() {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const route = useRoute<{
    key: string;
    name: string;
    params?: { token?: string };
  }>();
  const setCredentials = useSession((session) => session.setCredentials);
  const [confirmUser] = useConfirmUserMutation();
  // Without a token (the link was cut short) there is nothing to confirm
  const [status, setStatus] = React.useState<'confirming' | 'confirmed' | 'failed'>(
    route?.params?.token ? 'confirming' : 'failed'
  );
  const navigation = useNavigation();

  React.useEffect(() => {
    if (route?.params?.token) {
      confirmUser({
        variables: {
          token: route.params.token,
        },
      })
        .then(({ data }) => {
          if (data?.userConfirmRegistrationWithToken?.credentials?.accessToken) {
            setCredentials(data.userConfirmRegistrationWithToken.credentials);
            setStatus('confirmed');
            navigation.navigate('Limbo', { screen: 'OperatorSelectScreen' });
          } else {
            setStatus('failed');
          }
        })
        .catch(() => {
          setStatus('failed');
        });
    }
  }, [confirmUser, navigation, route.params?.token, setCredentials]);

  let content: React.ReactNode;
  if (status === 'confirming') {
    content = (
      <>
        <ActivityIndicator color={theme.colour.brand} aria-label={t('auth.confirming')} />
        <Text variant="title" role="heading" aria-level={1} align="center">
          {t('auth.confirming')}
        </Text>
      </>
    );
  } else if (status === 'failed') {
    content = (
      <>
        <Icon name="close-circle-outline" size={56} tone="blocked" />
        <Text variant="title" role="heading" aria-level={1} align="center">
          {t('auth.confirmFailed')}
        </Text>
        <Text tone="muted" align="center">
          {t('auth.confirmFailedBody')}
        </Text>
      </>
    );
  } else {
    content = (
      <>
        <Icon name="check-circle-outline" size={56} tone="ok" />
        <Text variant="title" role="heading" aria-level={1} align="center">
          {t('auth.confirmed')}
        </Text>
        <Text tone="muted" align="center">
          {t('auth.confirmedBody')}
        </Text>
      </>
    );
  }

  return (
    <ScreenContainer>
      <View
        style={{
          flexGrow: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.space.md,
          padding: theme.space.xl,
        }}
      >
        {content}
      </View>
    </ScreenContainer>
  );
}

export default ConfirmUserScreen;
