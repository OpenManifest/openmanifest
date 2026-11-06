import * as React from 'react';
import { StyleSheet, FlatList, useWindowDimensions } from 'react-native';
import { FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useOperatorsContext } from 'app/api/crud';

import FloatingActionArea from 'app/components/layout/FloatingActionArea';
import ScreenContainer from 'app/components/layout/ScreenContainer';
import NoResults from '../../../components/NoResults';
import OperatorCard, { OPERATOR_CARD_SIZE } from './OperatorCard';
import { useAppTheme } from 'app/theme';
import { CHROME_MAX_FONT_SIZE_MULTIPLIER } from 'app/components/layout/fontScale';

export default function OperatorsScreen() {
  const { theme } = useAppTheme();
  const { operators, loading, refetch } = useOperatorsContext();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  // As many cards as fit next to each other
  const numColumns = Math.max(1, Math.floor(width / OPERATOR_CARD_SIZE));

  return (
    <ScreenContainer>
      <FlatList
        key={`operators-columns-${numColumns}`}
        data={operators}
        numColumns={numColumns}
        refreshing={loading}
        keyExtractor={(item) => `operator-${item?.id}`}
        onRefresh={() => refetch()}
        style={styles.flatlist}
        contentContainerStyle={styles.content}
        ListEmptyComponent={() => (
          <NoResults title="No dropzones?" subtitle="You can set one up!" />
        )}
        renderItem={({ item: operator }) => (!operator ? null : <OperatorCard {...{ operator }} />)}
      />
      <FloatingActionArea>
        <FAB
          labelMaxFontSizeMultiplier={CHROME_MAX_FONT_SIZE_MULTIPLIER}
          testID="create-operator-primary-action"
          style={{ backgroundColor: theme.colors.primary }}
          small
          icon="plus"
          onPress={() => {
            navigation.navigate('Wizards', { screen: 'OperatorWizardScreen' });
          }}
          label="Create dropzone"
        />
      </FloatingActionArea>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flatlist: { flex: 1, width: '100%' },
  content: {
    flexGrow: 1,
    width: '100%',
    // Room for the floating button below the last row
    paddingBottom: 96,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
