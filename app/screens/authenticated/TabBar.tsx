import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { AuthenticatedRoutes } from './routes';

export default createBottomTabNavigator<AuthenticatedRoutes>();
