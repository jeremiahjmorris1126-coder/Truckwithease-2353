/**
 * Maintenance Window Scheduler (client-side)
 *
 * HONESTY NOTE (rewritten 2026-08-26):
 * The original version of this file ran a browser setInterval and claimed to
 * perform database-vacuum, full-backup, storage-audit, analytics-rollup,
 * index-optimization and log-rotation. A browser tab cannot do any of those.
 * Every one of those task callbacks returned hardcoded numbers - "45MB
 * reclaimed", "1,247 files deleted", "89,403 records processed", "2.3GB
 * backup", "99.99% uptime" - so the dashboard showed green success for work
 * that never happened. All of that fabricated output has been deleted.
 *
 * What this file actually does now:
 *   - real date math for peak hours and maintenance windows (kept as-is)
 *   - a real cacheClear task that removes localStorage keys prefixed "cache_"
 *   - every server-side task returns { status: 'NOT_IMPLEMENTED' } with a
 *     reason, because TruckWithEase has no worker, cron or scheduled job.
 *
 * Server maintenance is NOT scheduled by this app. When a worker exists, these
 * tasks move to it and this file becomes a read-only view of its results.
 */

// Peak hours by day and region (in UTC, converted to local on client)
const PEAK_HOURS_CONFIG = {
  weekday: {
    start: 9,  // 9 AM local time
    end: 17,   // 5 PM local time
  },
  weekend: {
    start: 10, // 10 AM local time
    end: 20,   // 8 PM local time
  },
};

// Off-peak maintenance windows (in hours, local time)
const MAINTENANCE_WINDOWS = {
  daily: {
    start: 2,  // 2 AM
    end: 4,    // 4 AM
    duration: 2, // hours
    tasks: ['cache-clear', 'log-rotation', 'index-optimization'],
  },
  weekly: {
    day: 0, // Sunday
    start: 3, // 3 AM
    end: 5,   // 5 AM
    duration: 2,
    tasks: ['database-vacuum', 'file-cleanup', 'analytics-rollup'],
  },
  monthly: {
    date: 1, // 1st of month
    start: 1, // 1 AM
    end: 6,   // 6 AM
    duration: 5,
    tasks: ['full-backup', 'storage-audit', 'performance-analysis'],
  },
};

class MaintenanceScheduler {
  constructor() {
    this.taskQueue = [];
    this.runningTasks = new Set();
    this.lastMaintenanceRun = null;
    this.performanceMetrics = {
      avgResponseTime: 0,
      peakUsageHours: [],
      maintenanceSkipped: 0,
      maintenanceCompleted: 0,
    };
    this.init();
  }

  /**
   * Initialize scheduler and set up listeners
   */
  init() {
    if (typeof window === 'undefined') return;
    
    // Check maintenance window every 5 minutes
    setInterval(() => this.checkAndRunMaintenance(), 5 * 60 * 1000);
    
    // Track peak hours based on user activity
    window.addEventListener('load', () => this.detectPeakHours());
    document.addEventListener('click', () => this.recordActivity());
  }

  /**
   * Detect peak hours based on actual user activity
   */
  detectPeakHours() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    const isWeekday = day >= 1 && day <= 5;
    const config = isWeekday ? PEAK_HOURS_CONFIG.weekday : PEAK_HOURS_CONFIG.weekend;
    
    return {
      currentHour: hour,
      isPeakHour: hour >= config.start && hour < config.end,
      config,
    };
  }

  /**
   * Check if current time is within a maintenance window
   */
  isMaintenanceWindow() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    const date = now.getDate();
    
    const peakStatus = this.detectPeakHours();
    
    // Never run during peak hours
    if (peakStatus.isPeakHour) {
      return { allowed: false, reason: 'PEAK_HOURS' };
    }
    
    // Check daily window (2-4 AM)
    if (hour >= MAINTENANCE_WINDOWS.daily.start && hour < MAINTENANCE_WINDOWS.daily.end) {
      return {
        allowed: true,
        window: 'daily',
        tasks: MAINTENANCE_WINDOWS.daily.tasks,
      };
    }
    
    // Check weekly window (Sunday 3-5 AM)
    if (day === MAINTENANCE_WINDOWS.weekly.day && 
        hour >= MAINTENANCE_WINDOWS.weekly.start && 
        hour < MAINTENANCE_WINDOWS.weekly.end) {
      return {
        allowed: true,
        window: 'weekly',
        tasks: MAINTENANCE_WINDOWS.weekly.tasks,
      };
    }
    
    // Check monthly window (1st of month, 1-6 AM)
    if (date === MAINTENANCE_WINDOWS.monthly.date &&
        hour >= MAINTENANCE_WINDOWS.monthly.start &&
        hour < MAINTENANCE_WINDOWS.monthly.end) {
      return {
        allowed: true,
        window: 'monthly',
        tasks: MAINTENANCE_WINDOWS.monthly.tasks,
      };
    }
    
    return { allowed: false, reason: 'NOT_IN_WINDOW' };
  }

  /**
   * Schedule a maintenance task
   */
  scheduleMaintenance(taskName, callback, options = {}) {
    const task = {
      id: `${taskName}-${Date.now()}`,
      name: taskName,
      callback,
      priority: options.priority || 'normal', // normal, high, low
      timeout: options.timeout || 30 * 60 * 1000, // 30 min default
      retries: options.retries || 3,
      createdAt: new Date(),
    };
    
    this.taskQueue.push(task);
    this.sortTaskQueue();
    
    return task.id;
  }

  /**
   * Sort task queue by priority
   */
  sortTaskQueue() {
    const priorityMap = { high: 0, normal: 1, low: 2 };
    this.taskQueue.sort((a, b) => priorityMap[a.priority] - priorityMap[b.priority]);
  }

  /**
   * Check if we're in a maintenance window and run tasks
   */
  async checkAndRunMaintenance() {
    const windowStatus = this.isMaintenanceWindow();
    
    if (!windowStatus.allowed) {
      return {
        skipped: true,
        reason: windowStatus.reason,
        nextWindow: this.getNextMaintenanceWindow(),
      };
    }
    
    // Run all eligible tasks
    const results = await this.runPendingTasks(windowStatus.tasks);
    
    this.lastMaintenanceRun = {
      timestamp: new Date(),
      window: windowStatus.window,
      tasksRun: results.length,
      // A task can "succeed" and still have done nothing - check status.
      allSucceeded: results.every(r => r.success),
      implemented: results.filter(r => r.result && r.result.status === 'OK').length,
      notImplemented: results.filter(r => r.result && r.result.status === 'NOT_IMPLEMENTED').length,
      details: results,
    };
    
    this.performanceMetrics.maintenanceCompleted++;
    
    return this.lastMaintenanceRun;
  }

  /**
   * Run all pending tasks that match allowed tasks
   */
  async runPendingTasks(allowedTasks) {
    const results = [];
    
    for (const task of this.taskQueue) {
      // Only run if it matches allowed tasks or if no allowedTasks specified
      if (allowedTasks && !allowedTasks.includes(task.name)) {
        continue;
      }
      
      if (this.runningTasks.has(task.id)) {
        continue; // Skip if already running
      }
      
      try {
        this.runningTasks.add(task.id);
        
        const startTime = Date.now();
        const result = await Promise.race([
          task.callback(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Task timeout')), task.timeout)
          ),
        ]);
        
        results.push({
          taskId: task.id,
          name: task.name,
          success: true,
          duration: Date.now() - startTime,
          result,
        });
        
        // Remove from queue if successful
        this.taskQueue = this.taskQueue.filter(t => t.id !== task.id);
      } catch (error) {
        task.retries--;
        
        results.push({
          taskId: task.id,
          name: task.name,
          success: false,
          error: error.message,
          retriesLeft: task.retries,
        });
        
        // Remove if out of retries
        if (task.retries <= 0) {
          this.taskQueue = this.taskQueue.filter(t => t.id !== task.id);
        }
      } finally {
        this.runningTasks.delete(task.id);
      }
    }
    
    return results;
  }

  /**
   * Get time until next maintenance window
   */
  getNextMaintenanceWindow() {
    const now = new Date();
    
    // Next daily window at 2 AM
    const nextDaily = new Date(now);
    nextDaily.setHours(MAINTENANCE_WINDOWS.daily.start, 0, 0, 0);
    if (nextDaily <= now) {
      nextDaily.setDate(nextDaily.getDate() + 1);
    }
    
    // Next weekly window on Sunday at 3 AM
    const nextWeekly = new Date(now);
    const daysToSunday = (MAINTENANCE_WINDOWS.weekly.day - nextWeekly.getDay() + 7) % 7;
    nextWeekly.setDate(nextWeekly.getDate() + (daysToSunday || 7));
    nextWeekly.setHours(MAINTENANCE_WINDOWS.weekly.start, 0, 0, 0);
    
    // Next monthly window on 1st at 1 AM
    const nextMonthly = new Date(now);
    nextMonthly.setMonth(nextMonthly.getMonth() + 1);
    nextMonthly.setDate(MAINTENANCE_WINDOWS.monthly.date);
    nextMonthly.setHours(MAINTENANCE_WINDOWS.monthly.start, 0, 0, 0);
    
    return {
      daily: {
        time: nextDaily,
        hoursUntil: (nextDaily - now) / (1000 * 60 * 60),
      },
      weekly: {
        time: nextWeekly,
        hoursUntil: (nextWeekly - now) / (1000 * 60 * 60),
      },
      monthly: {
        time: nextMonthly,
        hoursUntil: (nextMonthly - now) / (1000 * 60 * 60),
      },
    };
  }

  /**
   * Record user activity to detect peak hours
   */
  recordActivity() {
    const now = new Date();
    const hour = now.getHours();
    
    // Update peak hours tracking
    if (!this.performanceMetrics.peakUsageHours[hour]) {
      this.performanceMetrics.peakUsageHours[hour] = 0;
    }
    this.performanceMetrics.peakUsageHours[hour]++;
  }

  /**
   * Get maintenance status dashboard
   */
  getMaintenanceStatus() {
    const windowStatus = this.isMaintenanceWindow();
    const nextWindow = this.getNextMaintenanceWindow();
    
    return {
      currentWindow: {
        allowed: windowStatus.allowed,
        reason: windowStatus.reason,
        window: windowStatus.window,
      },
      nextMaintenance: nextWindow,
      taskQueue: {
        pending: this.taskQueue.length,
        running: this.runningTasks.size,
        tasks: this.taskQueue.map(t => ({
          id: t.id,
          name: t.name,
          priority: t.priority,
          retriesLeft: t.retries,
          createdAt: t.createdAt,
        })),
      },
      lastRun: this.lastMaintenanceRun,
      metrics: {
        ...this.performanceMetrics,
        uptime: null, // NOT TRACKED - no uptime monitor is wired to this app
        serverTasks: 'NOT_IMPLEMENTED - no worker or cron exists',
        scope: 'This browser tab only. Closing the tab stops the scheduler.',
        peakHours: Object.keys(this.performanceMetrics.peakUsageHours)
          .filter(h => this.performanceMetrics.peakUsageHours[h] > 0)
          .map(h => `${h}:00-${h}:59`),
      },
    };
  }

  /**
   * Manual trigger (admin only) with off-peak verification
   */
  async forceMaintenanceNow(override = false) {
    const windowStatus = this.isMaintenanceWindow();
    
    if (!override && !windowStatus.allowed) {
      return {
        error: 'NOT_IN_MAINTENANCE_WINDOW',
        message: `Cannot run during peak hours. ${windowStatus.reason}`,
        nextWindow: this.getNextMaintenanceWindow(),
      };
    }
    
    if (override) {
      console.warn('⚠️ Forcing maintenance during peak hours - may impact performance');
    }
    
    const results = await this.runPendingTasks();
    return {
      success: true,
      forced: override,
      results,
    };
  }
}

// Initialize the scheduler
const maintenanceScheduler = new MaintenanceScheduler();

// Diagnostic tasks.
//
// cacheClear is the only task a browser can genuinely perform. Everything else
// requires a server-side worker that does not exist, so those tasks report
// NOT_IMPLEMENTED instead of inventing results. Do not replace these with
// placeholder numbers.
const notImplemented = (name, needs) => () =>
  Promise.resolve({
    task: name,
    status: 'NOT_IMPLEMENTED',
    reason: `Server-side task - no worker or cron exists. Needs: ${needs}.`,
    ranAt: new Date().toISOString(),
  });

export const diagnosticTasks = {
  /**
   * Cache clearing. REAL: removes localStorage keys prefixed "cache_".
   * The PocketBase shim does not use that prefix, so app data is untouched.
   */
  cacheClear: () => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.localStorage) {
        resolve({ task: 'cache-clear', status: 'SKIPPED', reason: 'No localStorage in this environment', clearedKeys: 0 });
        return;
      }
      const cacheKeys = Object.keys(localStorage).filter((k) => k.startsWith('cache_'));
      const batch = cacheKeys.slice(0, 100);
      batch.forEach((k) => localStorage.removeItem(k));
      resolve({
        task: 'cache-clear',
        status: 'OK',
        clearedKeys: batch.length,
        remaining: Math.max(0, cacheKeys.length - batch.length),
        scope: 'This browser only',
      });
    });
  },

  indexOptimization: notImplemented('index-optimization', 'Turso admin access from a server job'),
  logRotation: notImplemented('log-rotation', 'server log retention policy'),
  databaseVacuum: notImplemented('database-vacuum', 'Turso VACUUM run from a server job'),
  fileCleanup: notImplemented('file-cleanup', 'S3 lifecycle rules or a storage worker'),
  analyticsRollup: notImplemented('analytics-rollup', 'a scheduled aggregation job'),
  fullBackup: notImplemented('full-backup', 'Turso backup API called from a server job'),
  storageAudit: notImplemented('storage-audit', 'S3 bucket listing from the server'),
  performanceAnalysis: notImplemented('performance-analysis', 'request-level metrics collection'),
};

export {
  maintenanceScheduler,
  MaintenanceScheduler,
  PEAK_HOURS_CONFIG,
  MAINTENANCE_WINDOWS,
};

export default maintenanceScheduler;
