import * as React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Button } from "react-native-paper";
import { SwiperFlatList } from 'react-native-swiper-flatlist';
import { useAppSelector } from "../../redux";
import WizardPagination from "./Pagination";

interface IWizardProps {
  children: React.ReactNode;
  loading?: boolean;
  icons?: string[];
  onNext(currentIndex: number): Promise<boolean>;
}

function Wizard(props: IWizardProps) {
  const { children, icons, onNext, loading } = props;
  const [index, setIndex] = React.useState(0);
  const globalState = useAppSelector(state => state.global);
  const ref = React.useRef<SwiperFlatList>(null);

  const isLastItem = index === React.Children.count(children) - 1;

  return (
    <View style={styles.container}>
      <SwiperFlatList
        showPagination
        index={index}
        PaginationComponent={(props) => 
          <WizardPagination {...props} icons={icons} />
        }
        numColumns={1}
        scrollEnabled={false}
        autoplay={false}
        ref={ref}
        onChangeIndex={({ index, prevIndex }) => {
          console.log({ index, prevIndex });
          setIndex(index || 0);
        }}
      >
        {children}
      </SwiperFlatList>
      <Button
        key={`button-next-${index}`}
        loading={loading}
        mode="contained"
        color="#FFFFFF"
        style={styles.button}
        onPress={async () => {
          // @ts-ignore
          const shouldNavigate = await onNext(ref.current.getCurrentIndex());

          if (shouldNavigate) {
            // @ts-ignore
            ref.current.scrollToIndex({ index: ref.current.getCurrentIndex() + 1 });
          }
        }}
      >
        {
          isLastItem ? "Done" : "Next"
        }
      </Button>

      {
        index === 0
          ? null
          : (
            <Button
              key={`button-${index}`}
              mode="text"
              color="#FFFFFF"
              style={styles.buttonBack}
              onPress={async () => {
                // @ts-ignore
                ref.current.scrollToIndex({ index: ref.current.getCurrentIndex() - 1 });
              }}
            >
              {
                "Back"
              }
            </Button>     
          )
      }
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    width: 300
  },
  buttonBack: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    width: 300
  },
  container: {
    borderColor: "black",
    borderWidth: 2,
    width,
    flex: 1,
  },
});

export default Wizard;