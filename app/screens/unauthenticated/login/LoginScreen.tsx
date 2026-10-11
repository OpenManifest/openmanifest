import * as React from 'react';
import { Image, ImageBackground, StyleSheet, View } from 'react-native';
import { Card, useTheme } from 'react-native-paper';

import FormColumn from 'app/components/layout/FormColumn';
import ScreenContainer from 'app/components/layout/ScreenContainer';
import logoDark from '../../../../assets/images/logo-black.png';
import logoLight from '../../../../assets/images/logo-white.png';
import backgroundDark from '../../../../assets/images/webb-dark.png';
import backgroundLight from '../../../../assets/images/pattern.png';
import LoginForm from './form/LoginForm';

export default function LoginScreen() {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <ImageBackground
        source={theme.dark ? backgroundDark : backgroundLight}
        style={StyleSheet.absoluteFill}
        resizeMode="repeat"
      />
      <ScreenContainer style={styles.transparent}>
        <FormColumn contentContainerStyle={styles.content}>
          <Image
            source={theme.dark ? logoLight : logoDark}
            style={styles.logo}
            resizeMode="contain"
          />
          <Card style={styles.card} elevation={3}>
            <Card.Content>
              <LoginForm />
            </Card.Content>
          </Card>
        </FormColumn>
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  logo: { width: '60%', maxWidth: 300, aspectRatio: 1 },
  card: { width: '100%', maxWidth: 400, padding: 16, borderRadius: 8 },
});
