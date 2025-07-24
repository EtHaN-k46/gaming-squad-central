import { AppRegistry } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './AppNavigator';
import { name as appName } from '../app.json';
import React from 'react';

const App = () => (
  <NavigationContainer>
    <AppNavigator />
  </NavigationContainer>
);

AppRegistry.registerComponent(appName, () => App);

// This is required for web support
const root = document.getElementById('root');
if (root) {
  AppRegistry.runApplication(appName, { rootTag: root });
}
