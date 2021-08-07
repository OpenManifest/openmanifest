import * as React from 'react';
import { Dimensions, View, StyleSheet, ScrollViewProps } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Button, Title } from 'react-native-paper';
import { SafeAreaViewProps } from 'react-native-safe-area-context';
import ScrollableScreen from '../layout/ScrollableScreen';
import { WizardContext } from './Wizard';

export interface IWizardScreenProps extends SafeAreaViewProps {
  title?: string;
  loading?: boolean;
  backButtonLabel?: string;
  nextButtonLabel?: string;
  containerStyle?: ScrollViewProps['style'];
  contentStyle?: ScrollViewProps['contentContainerStyle'];
  disableScroll?: boolean;

  onBack(currentIndex: number, setIndex: (idx: number) => void): void;
  onNext(currentIndex: number, setIndex: (idx: number) => void): void;
}
function WizardScreen(props: IWizardScreenProps) {
  const {
    children,
    title,
    loading,
    onBack,
    backButtonLabel,
    nextButtonLabel,
    onNext,
    contentStyle,
    containerStyle,
    style,
    disableScroll,
  } = props;
  const { width, height } = Dimensions.get('window');

  const { index, setIndex } = React.useContext(WizardContext);

  const scrollRef = React.useRef<ScrollView>();

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ y: 0, animated: false });
      console.log('Scrolling ', title, ' to 0');
    } else {
      console.log('No ref');
    }
  }, [index, title]);

  return (
    <View style={StyleSheet.flatten([styles.wizardScreen, { width }, style])}>
      <ScrollableScreen
        style={[styles.container, containerStyle || {}, { width }]}
        contentContainerStyle={StyleSheet.flatten([
          styles.content,
          { minHeight: height, backgroundColor: 'transparent' },
          contentStyle,
        ])}
        scrollEnabled={!disableScroll}
        pointerEvents="box-none"
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ref={scrollRef}
      >
        <Title style={styles.title}>{title}</Title>
        {children}

        <View style={styles.buttons} pointerEvents="box-none">
          <Button
            key={`button-next-${index}`}
            loading={loading}
            mode="contained"
            color="#FFFFFF"
            disabled={loading}
            style={styles.button}
            onPress={async () => {
              console.log('onNext with index', index);
              onNext(index, setIndex);
            }}
          >
            {nextButtonLabel}
          </Button>

          {!onBack ? null : (
            <Button
              key={`button-${index}`}
              mode="text"
              disabled={loading}
              color="#FFFFFF"
              style={styles.buttonBack}
              onPress={async () => {
                onBack(index, setIndex);
              }}
            >
              {backButtonLabel}
            </Button>
          )}
        </View>
      </ScrollableScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  wizardScreen: {
    justifyContent: 'center',
  },
  container: {
    backgroundColor: '#FF1414',
    paddingHorizontal: 32,
    alignSelf: 'center',
  },
  content: { paddingTop: 200, flexGrow: 1, paddingBottom: 0 },
  title: {
    position: 'absolute',
    top: 140,
    marginBottom: 50,
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    alignSelf: 'center',
  },
  button: {
    alignSelf: 'center',
    width: '100%',
  },
  buttonBack: {
    alignSelf: 'center',
    width: '100%',
    marginHorizontal: 48,
  },
  buttons: {
    alignSelf: 'center',
    alignItems: 'flex-end',
    flexGrow: 1,
    justifyContent: 'flex-end',
    width: '100%',
    maxWidth: 404,
    marginBottom: 100,
  },
});

export default WizardScreen;
