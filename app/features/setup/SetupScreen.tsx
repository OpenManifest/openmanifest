import * as React from 'react';
import { ScrollView, View } from 'react-native';
import {
  StackActions,
  useNavigation,
  type NavigationProp,
  type ParamListBase,
} from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from 'app/components/layout/ScreenContainer';
import { FORM_COLUMN_MAX_WIDTH } from 'app/components/layout/FormColumn';
import useBreakpoint from 'app/components/layout/useBreakpoint';
import { EmptyState, useTheme } from 'app/ui';
import { SETUP_DETAIL_ROUTES, type SetupRoute } from './entries';
import SetupMenu from './SetupMenu';

/** The width of the Setup list beside a setup screen on a wide window */
export const SETUP_LIST_WIDTH = 360;

/**
 * Opens a setup screen. Beside the list (`replace`) the screen takes the place of the one shown, so Back returns to Setup;
 * the conditions live in the Manifest stack, where the navigation goes up to.
 */
export function openSetup(
  navigation: Pick<NavigationProp<ParamListBase>, 'navigate' | 'dispatch'>,
  route: SetupRoute,
  replace = false
) {
  if (route === 'WeatherConditionsScreen') navigation.navigate(route);
  else if (replace) navigation.dispatch(StackActions.replace(route));
  else navigation.navigate(route);
}

/** The list in its scrolling column, the width of a form */
function MenuColumn({ selected, onOpen }: React.ComponentProps<typeof SetupMenu>) {
  const theme = useTheme();
  return (
    <ScrollView
      contentContainerStyle={{
        width: '100%',
        maxWidth: FORM_COLUMN_MAX_WIDTH,
        alignSelf: 'center',
        padding: theme.space.lg,
      }}
    >
      <SetupMenu selected={selected} onOpen={onOpen} />
    </ScrollView>
  );
}

/**
 * Setup (`/configuration`): the grouped list. On a wide window the list stays at the side and the screen chosen opens
 * beside it (`SetupLayout`); here, before a choice, the side says what to do.
 */
export default function SetupScreen() {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const expanded = useBreakpoint() === 'expanded';
  const open = (route: SetupRoute) => openSetup(navigation, route);

  if (!expanded) {
    return (
      <ScreenContainer edges={['bottom']} testID="setup">
        <MenuColumn onOpen={open} />
      </ScreenContainer>
    );
  }
  return (
    <ScreenContainer edges={['bottom']} testID="setup">
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <View
          style={{
            width: SETUP_LIST_WIDTH,
            borderRightWidth: 1,
            borderRightColor: theme.colour.border,
          }}
        >
          <MenuColumn onOpen={open} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <EmptyState
            testID="setup-choose"
            icon="cog-outline"
            title={t('setupMenu.chooseTitle')}
            body={t('setupMenu.chooseBody')}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

export type SetupLayoutProps = {
  route: { name: string };
  navigation: Pick<NavigationProp<ParamListBase>, 'navigate' | 'dispatch'>;
  children: React.ReactElement;
};

/**
 * The layout of the Configuration stack's screens (its `screenLayout`): on a wide window a setup screen sits beside the
 * Setup list, with its entry marked; elsewhere the screen is alone.
 */
export function SetupLayout({ route, navigation, children }: SetupLayoutProps) {
  const theme = useTheme();
  const expanded = useBreakpoint() === 'expanded';

  if (!expanded || !SETUP_DETAIL_ROUTES.includes(route.name)) return children;
  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <View
        testID="setup-sidebar"
        style={{
          width: SETUP_LIST_WIDTH,
          borderRightWidth: 1,
          borderRightColor: theme.colour.border,
          backgroundColor: theme.colour.app,
        }}
      >
        <MenuColumn
          selected={route.name}
          onOpen={(next) => openSetup(navigation, next, next !== route.name)}
        />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>{children}</View>
    </View>
  );
}
