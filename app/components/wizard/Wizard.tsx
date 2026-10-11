import * as React from 'react';
import { FlatList, LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { useAppTheme } from 'app/theme';
import ScreenContainer from '../layout/ScreenContainer';
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

/** The position of the page being rendered; undefined outside of a wizard */
export const WizardPageContext = React.createContext<number | undefined>(undefined);

function Wizard(props: IWizardProps) {
  const { children, icons } = props;
  const { theme } = useAppTheme();
  const [width, setWidth] = React.useState(0);
  const [index, setIndex] = React.useState(0);
  const ref = React.useRef<FlatList>(null);
  const pages = React.useMemo(() => React.Children.toArray(children), [children]);
  const count = pages.length;

  const onLayout = React.useCallback((event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  }, []);

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
      <ScreenContainer style={{ backgroundColor: theme.colors.primary }}>
        <WizardPagination size={count} paginationIndex={index} icons={icons} width={width} />
        <View style={styles.pages} onLayout={onLayout}>
          {width ? (
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
              renderItem={({ item, index: pageIndex }) => (
                <WizardPageContext.Provider value={pageIndex}>
                  <View style={{ width }}>{item}</View>
                </WizardPageContext.Provider>
              )}
            />
          ) : null}
        </View>
      </ScreenContainer>
    </WizardContext.Provider>
  );
}

const styles = StyleSheet.create({
  pages: {
    flex: 1,
  },
});

export default Wizard;
