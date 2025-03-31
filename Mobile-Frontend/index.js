/**
 * @format
 */

import './gesture-handler';

import {AppRegistry, LogBox} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import { PaperProvider } from 'react-native-paper';
import React from 'react';
import theme from './src/theme';

// Silence all warnings in the UI
LogBox.ignoreAllLogs();

// Also filter console output for the warnings
// This is a more aggressive approach to silence the warnings in the console
if (__DEV__) {
  const IGNORED_WARNINGS = [
    'Support for defaultProps will be removed from function components',
    'Support for defaultProps will be removed from memo components',
  ];

  const originalConsoleWarn = console.warn;
  console.warn = (...args) => {
    const message = args.join(' ');
    if (!IGNORED_WARNINGS.some(warning => message.includes(warning))) {
      originalConsoleWarn(...args);
    }
  };

  const originalConsoleError = console.error;
  console.error = (...args) => {
    const message = args.join(' ');
    if (!IGNORED_WARNINGS.some(warning => message.includes(warning))) {
      originalConsoleError(...args);
    }
  };
}

function Main() {
  return (
    <PaperProvider theme={theme}>
      <App />
    </PaperProvider>
  );
}

AppRegistry.registerComponent(appName, () => Main);
