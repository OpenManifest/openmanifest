import { useNavigation } from '@react-navigation/core';
import { StyleSheet } from 'react-native';
import LottieView from 'app/components/LottieView';
import * as React from 'react';
import { Card, List } from 'react-native-paper';
import useCurrentDropzone from 'app/api/hooks/useCurrentDropzone';
import { actions, useAppDispatch } from 'app/state';

export default function SetupProfileCard() {
  const navigation = useNavigation();
  const { currentUser } = useCurrentDropzone();
  const dispatch = useAppDispatch();

  const onPress = React.useCallback(() => {
    if (currentUser) {
      dispatch(actions.forms.user.setOriginal(currentUser));
      if (currentUser?.user?.rigs?.length) {
        dispatch(actions.forms.rig.setOriginal(currentUser.user.rigs[0]));
      }
      navigation.navigate('Wizards', {
        screen: 'UserWizardScreen',
      });
    }
  }, [currentUser, dispatch, navigation]);

  return (
    <Card style={styles.card} {...{ onPress }}>
      <Card.Content style={styles.content}>
        <List.Item
          title="Complete your profile"
          description="Let this dropzone know who you are"
          titleStyle={{ marginBottom: 4 }}
          left={() => (
            <LottieView
              style={{ height: 80, width: 80 }}
              autoPlay
              loop={false}
              // eslint-disable-next-line global-require
              source={require('../../../../../assets/images/profile2.json')}
            />
          )}
          right={(props) => <List.Icon {...props} icon="chevron-right" style={styles.icon} />}
        />
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, borderRadius: 8 },
  content: { paddingHorizontal: 4, paddingVertical: 4 },
  icon: { alignSelf: 'center' },
});
