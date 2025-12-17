package com.ascennoxus.app;

import android.app.AppOpsManager;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.Intent;
import android.provider.Settings;
import android.os.Process;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@CapacitorPlugin(name = "AppBlocker")
public class AppBlockerPlugin extends Plugin {

    private ScheduledExecutorService scheduler;
    private Set<String> blockedPackages = new HashSet<>();
    private boolean isRunning = false;

    @PluginMethod
    public void checkPermissions(PluginCall call) {
        boolean granted = hasUsageStatsPermission();
        if (!granted) {
            Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
            getContext().startActivity(intent);
        }
        JSObject ret = new JSObject();
        ret.put("granted", granted);
        call.resolve(ret);
    }

    @PluginMethod
    public void setBlockedApps(PluginCall call) {
        // Receives a list of package names (e.g., ["com.instagram.android", "com.zhiliaoapp.musically"])
        // For simplicity in this demo, we might receive names and need to map them, 
        // but let's assume the JS sends raw names or we block specific hardcoded ones for demo.
        JSObject items = call.getData();
        // In a real app, parse the array from 'items'
        
        // For demo purposes, let's just add common distractors if the user sends "true"
        blockedPackages.add("com.instagram.android");
        blockedPackages.add("com.zhiliaoapp.musically"); // TikTok
        blockedPackages.add("com.twitter.android");
        
        call.resolve();
    }

    @PluginMethod
    public void startMonitoring(PluginCall call) {
        if (isRunning) {
            call.resolve();
            return;
        }

        isRunning = true;
        scheduler = Executors.newSingleThreadScheduledExecutor();
        scheduler.scheduleAtFixedRate(this::checkForegroundApp, 0, 1, TimeUnit.SECONDS);
        
        call.resolve();
    }

    @PluginMethod
    public void stopMonitoring(PluginCall call) {
        if (scheduler != null) {
            scheduler.shutdown();
            scheduler = null;
        }
        isRunning = false;
        call.resolve();
    }

    private void checkForegroundApp() {
        if (!hasUsageStatsPermission()) return;

        String currentApp = getForegroundApp();
        if (currentApp != null && blockedPackages.contains(currentApp)) {
            // BLOCKING LOGIC: Bring OUR app to front
            Intent intent = new Intent(getContext(), MainActivity.class);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
            getContext().startActivity(intent);
        }
    }

    private String getForegroundApp() {
        UsageStatsManager usageStatsManager = (UsageStatsManager) getContext().getSystemService(Context.USAGE_STATS_SERVICE);
        long endTime = System.currentTimeMillis();
        long beginTime = endTime - 1000 * 10; // Check last 10 seconds

        List<UsageStats> usageStats = usageStatsManager.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, beginTime, endTime);
        
        if (usageStats != null && !usageStats.isEmpty()) {
            SortedMap<Long, UsageStats> sortedStats = new TreeMap<>();
            for (UsageStats stats : usageStats) {
                sortedStats.put(stats.getLastTimeUsed(), stats);
            }
            if (!sortedStats.isEmpty()) {
                return sortedStats.get(sortedStats.lastKey()).getPackageName();
            }
        }
        return null;
    }

    private boolean hasUsageStatsPermission() {
        AppOpsManager appOps = (AppOpsManager) getContext().getSystemService(Context.APP_OPS_SERVICE);
        int mode = appOps.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), getContext().getPackageName());
        return mode == AppOpsManager.MODE_ALLOWED;
    }
}
