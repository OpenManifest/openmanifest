import * as React from 'react';
import { Platform, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useIsFocused } from '@react-navigation/native';
import type { StackHeaderProps } from '@react-navigation/stack';
import { useOperatorContext } from 'app/providers/operator/context';
import { IconButton, Text, useStyles, useTheme } from 'app/ui';
import SetupBanner from './SetupBanner';

/** A search box in the header (the list of people): the text, the setter and whether the box is open */
export type HeaderSearch = {
  visible: boolean;
  text: string;
  placeholder: string;
  setVisible(visible: boolean): void;
  onChange(text: string): void;
};

export type ScreenHeaderProps = StackHeaderProps & {
  /** No setup warnings under the header (the inbox) */
  hideWarnings?: boolean;
  search?: HeaderSearch;
};

/**
 * The header of every screen of the stacks: the title, a back button named after the screen it returns to on detail
 * screens, the actions the screen gives (`options.headerRight`), an optional search box and the setup warnings of the
 * signed-in member. On the web the document title follows: "<screen> · <operator>".
 */
export default function ScreenHeader({
  back,
  navigation,
  options,
  hideWarnings,
  search,
}: ScreenHeaderProps) {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const focused = useIsFocused();
  const {
    operator: { operator },
  } = useOperatorContext();
  const title = typeof options.title === 'string' ? options.title : '';
  const styles = useStyles((tokens) => ({
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: tokens.space.sm,
      minHeight: tokens.density.touchTarget * 1.25,
      paddingHorizontal: tokens.space.md,
      backgroundColor: tokens.colour.surface,
      borderBottomWidth: 1,
      borderBottomColor: tokens.colour.border,
    },
    title: { flexGrow: 1, flexShrink: 1 },
    input: {
      ...tokens.type.body,
      flexGrow: 1,
      color: tokens.colour.text,
      paddingVertical: tokens.space.sm,
    },
  }));

  React.useEffect(() => {
    if (Platform.OS !== 'web' || !focused || !title) return;
    document.title = operator?.name ? `${title} · ${operator.name}` : title;
  }, [focused, operator?.name, title]);

  const searching = !!search?.visible;

  return (
    <View role="banner" testID="screen-header">
      <View style={styles.bar}>
        {back ? (
          <IconButton
            icon="arrow-left"
            aria-label={back.title ? t('header.backTo', { title: back.title }) : t('header.back')}
            testID="header-back"
            onPress={navigation.goBack}
          />
        ) : null}
        {searching ? (
          <TextInput
            autoFocus
            role="searchbox"
            aria-label={search.placeholder}
            placeholder={search.placeholder}
            placeholderTextColor={theme.colour.textMuted}
            value={search.text}
            onChangeText={search.onChange}
            style={styles.input}
          />
        ) : (
          <View style={styles.title}>
            <Text variant="title" chrome role="heading" aria-level={1} numberOfLines={1}>
              {title}
            </Text>
          </View>
        )}
        {options.headerRight && !searching
          ? options.headerRight({ tintColor: theme.colour.text })
          : null}
        {search ? (
          <IconButton
            icon={searching ? 'close' : 'magnify'}
            aria-label={searching ? t('header.closeSearch') : search.placeholder}
            testID="header-search"
            onPress={() => search.setVisible(!searching)}
          />
        ) : null}
      </View>
      {hideWarnings ? null : <SetupBanner />}
    </View>
  );
}
