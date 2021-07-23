import * as React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { SwiperFlatList } from 'react-native-swiper-flatlist';
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
  const [index, setIndex] = React.useState(0);
  const ref = React.useRef<SwiperFlatList>(null);
  const count = React.Children.count(children);

  return (
    <WizardContext.Provider
      value={{
        index,
        count,
        setIndex: (idx) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ref.current?.scrollToIndex({ index: idx, animated: true });
        },
      }}
    >
      <View style={[styles.container]}>
        <SwiperFlatList
          showPagination
          index={index}
          PaginationComponent={(wizardProps) => <WizardPagination {...wizardProps} icons={icons} />}
          numColumns={1}
          scrollEnabled={false}
          autoplay={false}
          ref={ref}
          onChangeIndex={({ index: idx, prevIndex }) => {
            setIndex(idx || 0);
          }}
        >
          {children}
        </SwiperFlatList>
      </View>
    </WizardContext.Provider>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    width,
    flex: 1,
    paddingBottom: 0,
  },
});

export default Wizard;
