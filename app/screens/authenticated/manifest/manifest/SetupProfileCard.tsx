import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import LottieView from 'app/components/LottieView';
import * as React from 'react';
import { Card, List } from 'react-native-paper';
import useProfileWizard from 'app/hooks/navigation/useProfileWizard';

export default function SetupProfileCard() {
  const openWizard = useProfileWizard();
  const { t } = useTranslation(['common', 'terms']);
  const onPress = React.useCallback(() => openWizard(), [openWizard]);

  return (
    <Card style={styles.card} {...{ onPress }}>
      <Card.Content style={styles.content}>
        <List.Item
          title={t('common:legacy.setup.profile')}
          description={t('common:legacy.setup.profileBody', {
            operator: t('terms:operator', { count: 1 }).toLowerCase(),
          })}
          titleStyle={{ marginBottom: 4 }}
          left={() => (
            <LottieView
              style={{ height: 80, width: 80 }}
              autoPlay
              loop={false}
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
