import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Title } from 'react-native-paper';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { SafeAreaViewProps } from 'react-native-safe-area-context';
import { useAppTheme } from 'app/theme';
import FormColumn from '../layout/FormColumn';
import { WizardContext, WizardPageContext } from './Wizard';

type ScrollContentStyle = React.ComponentProps<typeof FormColumn>['contentContainerStyle'];

export interface IWizardScreenProps extends SafeAreaViewProps {
  title?: string;
  loading?: boolean;
  backButtonLabel?: string;
  nextButtonLabel?: string;
  contentStyle?: ScrollContentStyle;
  disableScroll?: boolean;

  onBack(currentIndex: number, setIndex: (idx: number) => void): void;
  onNext(currentIndex: number, setIndex: (idx: number) => void): void;
}

/** Keeps the focused input above the buttons that rise with the keyboard */
const BUTTONS_CLEARANCE = 128;

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
    style,
    disableScroll,
  } = props;

  const { index, setIndex } = React.useContext(WizardContext);
  const pageIndex = React.useContext(WizardPageContext);
  // All pages are mounted: only the shown one has a primary action
  const isCurrent = pageIndex === undefined || pageIndex === index;
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();

  const scrollRef = React.useRef<React.ElementRef<typeof FormColumn>>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [index, title]);

  return (
    <View style={[styles.wizardScreen, style]}>
      <FormColumn
        ref={scrollRef}
        bottomOffset={BUTTONS_CLEARANCE}
        scrollEnabled={!disableScroll}
        contentContainerStyle={[styles.content, contentStyle]}
      >
        {title ? <Title style={styles.title}>{title}</Title> : null}
        {children}
      </FormColumn>

      <KeyboardStickyView offset={{ closed: 0, opened: insets.bottom }}>
        <View style={styles.buttons}>
          <Button
            testID={isCurrent ? 'wizard-next-primary-action' : undefined}
            key={`button-next-${index}`}
            loading={loading}
            mode="contained"
            buttonColor="#FFFFFF"
            textColor={theme.colors.primary}
            disabled={loading}
            style={styles.button}
            onPress={async () => {
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
              textColor="#FFFFFF"
              style={styles.button}
              onPress={async () => {
                onBack(index, setIndex);
              }}
            >
              {backButtonLabel}
            </Button>
          )}
        </View>
      </KeyboardStickyView>
    </View>
  );
}

const styles = StyleSheet.create({
  wizardScreen: {
    flex: 1,
    width: '100%',
  },
  content: { paddingTop: 16, paddingBottom: 16 },
  title: {
    marginBottom: 24,
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
  buttons: {
    alignSelf: 'center',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    width: '100%',
    maxWidth: 404,
    padding: 16,
  },
});

export default WizardScreen;
