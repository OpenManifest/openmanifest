import { StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/core';
import * as React from 'react';
import { Avatar } from 'react-native-paper';
import { successColor, warningColor } from '../../../constants/Colors';

function ConfirmUserScreen() {
  const route = useRoute<{
    key: string;
    name: string;
    params?: { account_confirmation_success?: string };
  }>();

  return route?.params?.account_confirmation_success === 'true' ? (
    <View style={styles.container}>
      <Avatar.Icon icon="check" style={styles.icon} />
      <Text style={styles.title}>All done!</Text>
      <Text style={styles.subtitle}>You can now log in</Text>
    </View>
  ) : (
    <View style={styles.container}>
      <Avatar.Icon icon="close" style={styles.errorIcon} />
      <Text style={styles.title}>Oops!</Text>
      <Text style={styles.subtitle}>Something went wrong. Please contact support</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#FF0000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    backgroundColor: successColor,
    marginBottom: 16,
  },
  errorIcon: {
    backgroundColor: warningColor,
    marginBottom: 16,
  },
  title: {
    fontSize: 38,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 26,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default ConfirmUserScreen;
