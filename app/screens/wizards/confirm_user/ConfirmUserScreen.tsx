import { StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/core';
import * as React from 'react';
import { Avatar } from 'react-native-paper';
import { successColor, warningColor } from '../../../constants/Colors';
import LottieView from '../../../components/LottieView';
import { useConfirmUserMutation } from '../../../api/reflection';
import { actions, useAppDispatch } from '../../../state';
import { User } from '../../../api/schema.d';

function ConfirmUserScreen() {
  const route = useRoute<{
    key: string;
    name: string;
    // eslint-disable-next-line camelcase
    params?: { token?: string };
  }>();
  const dispatch = useAppDispatch();
  const [confirmUser, mutation] = useConfirmUserMutation();
  const animation = React.useRef<LottieView>(null);
  const [error, setError] = React.useState(false);
  const navigation = useNavigation();

  React.useEffect(() => {
    if (route?.params?.token) {
      confirmUser({
        variables: {
          token: route.params.token,
        },
      })
        .then(({ data, errors }) => {
          if (data?.userConfirmRegistrationWithToken?.credentials?.accessToken) {
            dispatch(
              actions.global.setCredentials(data.userConfirmRegistrationWithToken.credentials)
            );
            dispatch(
              actions.global.setUser(data.userConfirmRegistrationWithToken.authenticatable as User)
            );
            navigation.navigate('Limbo', { screen: 'DropzoneSelectScreen' });
          } else {
            setError(true);
          }
        })
        .catch(() => {
          setError(true);
        });
    }
  }, [confirmUser, dispatch, navigation, route.params?.token]);

  if (mutation.loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>OpenManifest</Text>
        <LottieView
          autoPlay
          loop
          ref={animation}
          style={{
            width: 120,
            height: 120,
            marginTop: 24,
            marginBottom: 32,
          }}
          // eslint-disable-next-line global-require
          source={require('../../../../assets/images/loading.json')}
        />
        <Text style={styles.subtitle}>Confirming...</Text>
      </View>
    );
  }

  return !error ? (
    <View style={styles.container}>
      <Avatar.Icon icon="check" style={styles.icon} />
      <Text style={styles.title}>All done!</Text>
      <Text style={styles.subtitle}>You can now log in</Text>
    </View>
  ) : (
    <View style={styles.container}>
      <Avatar.Icon icon="close" style={styles.errorIcon} />
      <Text style={styles.title}>Oops!</Text>
      <Text style={styles.subtitle}>Something went wrong.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#EFEFEF',
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
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 26,
    textAlign: 'center',
  },
});

export default ConfirmUserScreen;
