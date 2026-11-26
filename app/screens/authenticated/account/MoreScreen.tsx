import * as React from 'react';
import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLinkTo } from '@react-navigation/native';
import useDestinations from 'app/navigation/useDestinations';
import { useStyles } from 'app/ui';
import Row from './Row';
import Section from './Section';

/** What does not fit in the bar of a phone: the places of the `more` group the user may use, and the account */
export default function MoreScreen() {
  const { t } = useTranslation('common');
  const linkTo = useLinkTo();
  const { destinations } = useDestinations();
  const styles = useStyles((theme) => ({
    content: { paddingVertical: theme.space.lg, gap: theme.space.lg },
  }));
  const more = destinations.filter(
    (destination) => destination.group === 'more' && (destination.path || destination.route)
  );

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Section title={t('more.title')}>
        {more.map((destination) => (
          <Row
            key={destination.key}
            testID={`more-${destination.key}`}
            icon={destination.icon}
            label={t(destination.labelKey)}
            onPress={() => linkTo((destination.path ?? destination.route?.path) as string)}
          />
        ))}
        <Row
          testID="more-account"
          icon="account-circle-outline"
          label={t('destinations.account')}
          onPress={() => linkTo('/account')}
        />
      </Section>
    </ScrollView>
  );
}
