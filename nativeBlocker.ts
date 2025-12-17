import { registerPlugin } from '@capacitor/core';

export interface AppBlockerPlugin {
    checkPermissions(): Promise<{ granted: boolean }>;
    setBlockedApps(options: { packages: string[] }): Promise<void>;
    startMonitoring(): Promise<void>;
    stopMonitoring(): Promise<void>;
    getInstalledApps(): Promise<{ apps: { packageName: string; label: string }[] }>;
    openSettings(): Promise<void>;
    addListener(eventName: 'blockTriggered', listenerFunc: (data: { blockedApp: string }) => void): Promise<any> & { remove: () => void };
}

const AppBlocker = registerPlugin<AppBlockerPlugin>('AppBlocker');

export default AppBlocker;
