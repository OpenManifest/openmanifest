import { AnimatedTabBarNavigator } from 'react-native-animated-nav-tab-bar';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { AuthenticatedRoutes } from './routes';

export default (AnimatedTabBarNavigator as typeof createBottomTabNavigator)<AuthenticatedRoutes>();
