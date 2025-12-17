import { registerPlugin } from '@capacitor/core';

export interface AppBlockerPlugin {
    checkPermissions(): Promise<{ granted: boolean }>;
    setBlockedApps(options: { packages: string[] }): Promise<void>;
    startMonitoring(): Promise<void>;
    stopMonitoring(): Promise<void>;
}

const AppBlocker = registerPlugin<AppBlockerPlugin>('AppBlocker');

export default AppBlocker;
