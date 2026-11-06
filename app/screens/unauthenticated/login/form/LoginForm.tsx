import * as React from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { FormTextField } from 'app/components/input/text/TextField';
import { Button, Divider, Text, useTheme } from 'app/ui';
import AppleButton from './AppleButton';
import useLoginForm from './useForm';

/** Email and password, "Forgot your password?", log in, Sign in with Apple (iOS) and sign up */
export default function LoginForm() {
  const { t } = useTranslation('common');
  const navigation = useNavigation();
  const theme = useTheme();
  const { control, onSubmit, loading, loginWithApple } = useLoginForm();

  return (
    <View style={{ gap: theme.space.md }}>
      <FormTextField
        {...{ control }}
        name="email"
        label={t('auth.email')}
        disabled={!!loading}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
      />
      <FormTextField
        {...{ control }}
        name="password"
        label={t('auth.password')}
        disabled={!!loading}
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        onSubmitEditing={onSubmit}
      />
      <Button
        label={t('auth.forgotPassword')}
        variant="tertiary"
        disabled={!!loading}
        onPress={() => navigation.navigate('Wizards', { screen: 'RecoverPasswordScreen' })}
      />
      <Button
        testID="login-primary-action"
        label={t('auth.logIn')}
        loading={!!loading}
        onPress={onSubmit}
        fullWidth
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.md }}>
        <View style={{ flex: 1 }}>
          <Divider />
        </View>
        <Text variant="caption" tone="muted">
          {t('auth.or')}
        </Text>
        <View style={{ flex: 1 }}>
          <Divider />
        </View>
      </View>
      <AppleButton onPress={loginWithApple} />
      <Button
        testID="signup-primary-action"
        label={t('auth.signUp')}
        variant="secondary"
        onPress={() => navigation.navigate('Unauthenticated', { screen: 'SignUpScreen' })}
        fullWidth
      />
    </View>
  );
}
