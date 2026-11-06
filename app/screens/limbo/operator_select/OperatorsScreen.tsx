import * as React from 'react';
import { FlatList, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useOperatorsContext } from 'app/api/crud';
import FloatingActionArea from 'app/components/layout/FloatingActionArea';
import { FORM_COLUMN_MAX_WIDTH } from 'app/components/layout/FormColumn';
import ScreenContainer from 'app/components/layout/ScreenContainer';
import useTerms from 'app/i18n/useTerms';
import { Button, Divider, EmptyState, Text, useStyles, type Theme } from 'app/ui';
import OperatorCard from './OperatorCard';

/** The operators the user can open (theirs and the public ones), and setting up a new one */
export default function OperatorsScreen() {
  const { t } = useTranslation('common');
  const term = useTerms();
  const styles = useStyles(stylesFor);
  const { operators, loading, refetch } = useOperatorsContext();
  const navigation = useNavigation();
  const operator = term('operator');
  const onCreate = React.useCallback(() => {
    navigation.navigate('Wizards', { screen: 'OperatorWizardScreen' });
  }, [navigation]);
  const list = (operators ?? []).filter(Boolean);

  return (
    <ScreenContainer>
      <FlatList
        data={list}
        refreshing={!!loading}
        keyExtractor={(item) => `operator-${item?.id}`}
        onRefresh={() => refetch()}
        style={styles.list}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text variant="title" role="heading" aria-level={1}>
              {t('operatorSelect.title', { operator: operator.toLowerCase() })}
            </Text>
          </View>
        }
        ListEmptyComponent={
          loading ? null : (
            <EmptyState
              icon="airplane-takeoff"
              title={t('operatorSelect.empty', { operators: term('operator', 2).toLowerCase() })}
              body={t('operatorSelect.emptyBody', { operator: operator.toLowerCase() })}
            />
          )
        }
        ItemSeparatorComponent={Divider}
        renderItem={({ item, index }) =>
          !item ? null : (
            <View
              style={[
                styles.item,
                index === 0 && styles.first,
                index === list.length - 1 && styles.last,
              ]}
            >
              <OperatorCard operator={item} />
            </View>
          )
        }
      />
      <FloatingActionArea>
        <Button
          testID="create-operator-primary-action"
          icon="plus"
          label={t('operatorSelect.create', { operator })}
          onPress={onCreate}
        />
      </FloatingActionArea>
    </ScreenContainer>
  );
}

const stylesFor = (theme: Theme) => ({
  list: { flex: 1, width: '100%' as const },
  content: {
    flexGrow: 1,
    width: '100%' as const,
    maxWidth: FORM_COLUMN_MAX_WIDTH,
    alignSelf: 'center' as const,
    paddingHorizontal: theme.space.lg,
    // Room for the floating button below the last row
    paddingBottom: theme.space.xxxl + theme.space.xxxl,
  },
  header: { paddingVertical: theme.space.lg },
  item: {
    backgroundColor: theme.colour.surface,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: theme.colour.border,
    overflow: 'hidden' as const,
  },
  first: {
    borderTopWidth: 1,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
  },
  last: {
    borderBottomWidth: 1,
    borderBottomLeftRadius: theme.radius.lg,
    borderBottomRightRadius: theme.radius.lg,
  },
});
