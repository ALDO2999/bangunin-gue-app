/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { registerTrackingService } from './src/services/trackingService';

// Must be registered before the app renders so the OS can resume the
// foreground service task after the app is backgrounded or killed.
registerTrackingService();

AppRegistry.registerComponent(appName, () => App);
