package com.ascennoxus.app;

import android.app.AppOpsManager;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
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
    private List<String> blockedPackages = new java.util.ArrayList<>();
    private boolean isRunning = false;

    @PluginMethod
    public void checkPermissions(PluginCall call) {
        boolean granted = hasUsageStatsPermission();
        // REMOVED auto-redirect
        JSObject ret = new JSObject();
        ret.put("granted", granted);
        call.resolve(ret);
    }

    @PluginMethod
    public void openSettings(PluginCall call) {
        Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
        getContext().startActivity(intent);
        call.resolve();
    }

    private void showToast(String msg) {
        new android.os.Handler(android.os.Looper.getMainLooper()).post(() -> {
            android.widget.Toast.makeText(getContext(), "[Noxus Debug] " + msg, android.widget.Toast.LENGTH_SHORT).show();
        });
    }

    @PluginMethod
    public void setBlockedApps(PluginCall call) {
        JSObject data = call.getData();
        try {
            org.json.JSONArray jsonArray = data.getJSONArray("packages");
            blockedPackages.clear();
            if (jsonArray != null) {
                for (int i = 0; i < jsonArray.length(); i++) {
                    blockedPackages.add(jsonArray.getString(i).toLowerCase());
                }
            }
            Log.d("AppBlocker", "Blocked list updated: " + blockedPackages.toString());
        } catch (Exception e) {
            Log.e("AppBlocker", "Error parsing blocked list", e);
        }
        call.resolve();
    }

    @PluginMethod
    public void startMonitoring(PluginCall call) {
        if (isRunning) {
            call.resolve();
            return;
        }

        if (!hasUsageStatsPermission()) {
            showToast("Permission Missing! Grant Usage Access.");
            // REMOVED auto-redirect. Simply fail/return.
            // Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
            // getContext().startActivity(intent);
            call.reject("PERMISSION_MISSING");
            return;
        }

        isRunning = true;
        showToast("Blocker Started Active");
        if (scheduler == null || scheduler.isShutdown()) {
             scheduler = Executors.newSingleThreadScheduledExecutor();
        }
        scheduler.scheduleAtFixedRate(this::checkForegroundApp, 0, 1, TimeUnit.SECONDS);
        
        call.resolve();
    }
    
    // ... stopMonitoring ...
    
    // ... getInstalledApps ...

    private void checkForegroundApp() {
        if (!hasUsageStatsPermission()) {
             // Optional: warn again?
             return;
        }

        String currentApp = getForegroundApp();
        if (currentApp != null) { // "com.instagram.android"
            String currentAppLower = currentApp.toLowerCase();
            
            // IGNORE if current app is NOXUS itself (to prevent self-loop)
            if (currentAppLower.contains("ascennoxus")) return;

            for (String keyword : blockedPackages) {
                if (currentAppLower.contains(keyword)) {
                    Log.d("AppBlocker", "Blocking " + currentApp + " matched keyword " + keyword);
                    
                    showToast("Blocking: " + keyword);

                    // BLOCKING LOGIC: Bring OUR app to front
                    Intent intent = new Intent(getContext(), MainActivity.class);
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                    intent.putExtra("isBlockedTrigger", true); // Signal to React
                    getContext().startActivity(intent);

                    // EMIT EVENT TO JS
                    JSObject ret = new JSObject();
                    ret.put("blockedApp", currentApp);
                    notifyListeners("blockTriggered", ret); 
                    break;
                }
            }
        }
    }

    private String getForegroundApp() {
        UsageStatsManager usageStatsManager = (UsageStatsManager) getContext().getSystemService(Context.USAGE_STATS_SERVICE);
        long endTime = System.currentTimeMillis();
        long beginTime = endTime - 1000 * 2; // Check last 2 seconds (tighter window)

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
