import * as React from 'react';
import { Image, ImageBackground, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import FormColumn from 'app/components/layout/FormColumn';
import ScreenContainer from 'app/components/layout/ScreenContainer';
import { Card, useStyles, useTheme, type Theme } from 'app/ui';
import logoDark from '../../../../assets/images/logo-black.png';
import logoLight from '../../../../assets/images/logo-white.png';
import backgroundDark from '../../../../assets/images/webb-dark.png';
import backgroundLight from '../../../../assets/images/pattern.png';
import LoginForm from './form/LoginForm';

/** The first screen of a signed-out user: the logo over the app's pattern, and the login form on a card */
export default function LoginScreen() {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const styles = useStyles(stylesFor);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={theme.isDark ? backgroundDark : backgroundLight}
        style={StyleSheet.absoluteFill}
        resizeMode="repeat"
        accessible={false}
      />
      <ScreenContainer style={styles.transparent}>
        <FormColumn contentContainerStyle={styles.content}>
          <Image
            source={theme.isDark ? logoLight : logoDark}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel={t('auth.logo')}
            role="img"
          />
          <View style={styles.card}>
            <Card variant="raised" padding="xl">
              <LoginForm />
            </Card>
          </View>
        </FormColumn>
      </ScreenContainer>
    </View>
  );
}

const stylesFor = (theme: Theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colour.app,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  content: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: theme.space.lg,
  },
  logo: { width: '60%' as const, maxWidth: 300, aspectRatio: 1 },
  card: { width: '100%' as const, maxWidth: 400 },
});
