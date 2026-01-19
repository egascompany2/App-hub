import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';

// Log helper with consistent tag for grepping
const TAG = '[EGAS][Diagnostics]';
const log = (...args: any[]) => console.log(TAG, ...args);

export async function runFirebaseDiagnostics(context: string) {
  log(`Running Firebase diagnostics (${context})...`);

  try {
    // Basic environment info
    log('Platform:', Platform.OS, Platform.Version);
    log('Package:', (Constants as any).expoConfig?.android?.package || 'unknown');
    log('Bundle ID (iOS):', (Constants as any).expoConfig?.ios?.bundleIdentifier || 'unknown');
    log('App ownership:', Constants.appOwnership || 'standalone');
    log('Native app version/build:', (Constants as any).nativeAppVersion, (Constants as any).nativeBuildVersion);
    log('RuntimeVersion:', (Constants.expoConfig as any)?.runtimeVersion);

    // Updates context
    try {
      const update = await Updates.getUpdateMetadataAsync();
      log('Updates.isEnabled:', Updates.isEnabled);
      log('Updates.channel:', (Updates as any).channel || 'n/a');
      log('Updates.isEmbeddedLaunch:', update?.isEmbeddedLaunch);
      log('Updates.updateId:', update?.updateId);
      log('Updates.runtimeVersion:', update?.runtimeVersion);
      log('Updates.manifest platform:', (update as any)?.manifest?.platform);
    } catch (e) {
      log('Updates metadata error:', e);
    }

    log('Skipping Firebase messaging diagnostics (module not included).');
  } catch (err) {
    log('Diagnostics runtime error:', err);
  }
}

export function setupGlobalErrorLogging() {
  const prevHandler = (ErrorUtils as any)?.getGlobalHandler?.();
  (ErrorUtils as any)?.setGlobalHandler?.((error: any, isFatal?: boolean) => {
    log('GlobalError:', { message: error?.message, isFatal, stack: error?.stack });
    try { runFirebaseDiagnostics('GlobalError'); } catch {}
    if (prevHandler) {
      try { prevHandler(error, isFatal); } catch {}
    }
  });
}

export function setupUpdatesLogging() {
  try {
    Updates.addListener((event) => {
      log('Updates event:', event.type, JSON.stringify(event));
    });
  } catch (e) {
    log('Failed to attach Updates listener:', e);
  }
}
