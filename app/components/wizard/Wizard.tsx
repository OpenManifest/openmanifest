import * as React from 'react';
import { FlatList, StyleSheet, useWindowDimensions, View } from 'react-native';
import WizardPagination from './Pagination';

interface IWizardProps {
  children: React.ReactNode;

  icons?: string[];
}

interface IWizardContext {
  count: number;
  index: number;
  setIndex(idx: number): void;
}

export const WizardContext = React.createContext<IWizardContext>({
  index: 0,
  count: 0,
  setIndex: () => null,
} as IWizardContext);

function Wizard(props: IWizardProps) {
  const { children, icons } = props;
  const { width } = useWindowDimensions();
  const [index, setIndex] = React.useState(0);
  const ref = React.useRef<FlatList>(null);
  const pages = React.useMemo(() => React.Children.toArray(children), [children]);
  const count = pages.length;

  const value = React.useMemo(
    () => ({
      index,
      count,
      setIndex: (idx: number) => {
        if (idx < 0 || idx >= count) {
          return;
        }
        ref.current?.scrollToIndex({ index: idx, animated: true });
        setIndex(idx);
      },
    }),
    [count, index]
  );

  return (
    <WizardContext.Provider value={value}>
      <View style={[styles.container, { width }]}>
        <FlatList
          ref={ref}
          horizontal
          pagingEnabled
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          data={pages}
          keyExtractor={(page, idx) =>
            React.isValidElement(page) && page.key ? String(page.key) : String(idx)
          }
          getItemLayout={(_, idx) => ({ length: width, offset: width * idx, index: idx })}
          renderItem={({ item }) => <View style={{ width }}>{item}</View>}
        />
        <WizardPagination size={count} paginationIndex={index} icons={icons} />
      </View>
    </WizardContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 0,
  },
});

export default Wizard;
