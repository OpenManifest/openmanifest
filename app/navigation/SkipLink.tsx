import * as React from 'react';
import { Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Tappable, useStyles } from 'app/ui';

/** The first stop of the keyboard on the web: jumps over the navigation to the content (`<main>`) of the screen */
export default function SkipLink() {
  const { t } = useTranslation('common');
  const styles = useStyles((theme) => ({
    link: {
      position: 'absolute',
      zIndex: 10,
      padding: theme.space.sm,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colour.brand,
    },
    hidden: { opacity: 0, width: 1, height: 1, overflow: 'hidden' },
    label: { ...theme.type.label, color: theme.colour.onBrand },
  }));

  const skip = React.useCallback(() => {
    const mains = Array.from(document.querySelectorAll<HTMLElement>('main'));
    // Screens of the other tabs stay mounted but hidden: take the one that is shown
    const shown = mains.find((main) => !main.hasAttribute('inert'));
    shown?.focus();
  }, []);

  return (
    <Tappable
      role="button"
      aria-label={t('navigation.skip')}
      onPress={skip}
      minTarget={false}
      style={({ focused }) => (focused ? styles.link : styles.hidden)}
    >
      <Text style={styles.label}>{t('navigation.skip')}</Text>
    </Tappable>
  );
}
