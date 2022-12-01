import * as React from 'react';
import { Image, ImageBackground, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Card, useTheme } from 'react-native-paper';

import useDevice, { ScreenOrientation } from 'app/hooks/useDevice';
import logoDark from '../../../../assets/images/logo-black.png';
import logoLight from '../../../../assets/images/logo-white.png';
import backgroundDark from '../../../../assets/images/webb-dark.png';
import backgroundLight from '../../../../assets/images/pattern.png';
import LoginForm from './form/LoginForm';

export default function LoginScreen() {
  const theme = useTheme();
  const { orientation } = useDevice();
  return (
    <ImageBackground
      source={theme.dark ? backgroundDark : backgroundLight}
      style={styles.container}
      resizeMode="repeat"
    >
      {orientation === ScreenOrientation.Portrait ? (
        <>
          <Image
            source={theme.dark ? logoLight : logoDark}
            style={styles.logo}
            resizeMode="contain"
          />
          <KeyboardAvoidingView
            style={styles.fields}
            behavior={Platform.OS === 'android' ? undefined : 'padding'}
          >
            <Card style={styles.card} elevation={3}>
              <Card.Content>
                <LoginForm />
              </Card.Content>
            </Card>
          </KeyboardAvoidingView>
        </>
      ) : (
        <KeyboardAvoidingView
          style={styles.fieldsLandscape}
          behavior={Platform.OS === 'android' ? undefined : 'padding'}
        >
          <Card style={styles.cardLandscape} elevation={3}>
            <Image
              source={theme.dark ? logoLight : logoDark}
              style={styles.logo}
              resizeMode="contain"
            />
            <Card.Content>
              <LoginForm />
            </Card.Content>
          </Card>
        </KeyboardAvoidingView>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: primaryColor,
    paddingTop: 10,
  },
  logo: { height: 300, width: '100%' },
  card: { padding: 16, borderRadius: 8 },
  cardLandscape: { height: '100%', width: '100%', justifyContent: 'center' },

  fields: {
    marginBottom: 10,
    marginTop: -50,
    maxWidth: 400,
    width: '100%',
    paddingHorizontal: 56,
    backgroundColor: 'transparent',
  },
  fieldsLandscape: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    width: 400,
  },
});
