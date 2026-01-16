(function() {
  'use strict';

  // ============================================
  // Google Drive Cloud Backup/Restore + V31 Queue System
  // ============================================

  const CLIENT_ID =
    "803066941400-pelvk18jb4s7jsqajbic3ig6e4g2c37p.apps.googleusercontent.com";
  const SCOPES = [
    "https://www.googleapis.com/auth/drive.appdata",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/tasks",
    "https://www.googleapis.com/auth/calendar.events"
  ].join(" ");
  let tokenClient;

  // Initialize APP namespace if not exists
  if (!window.APP) window.APP = {};

  // ============================================
  // CLOUD MODULE (V31 Phase 1)
  // ============================================
  
  window.APP.cloud = {
    // Queue Manager Constants
    QUEUE_STORAGE_KEY: 'google_sync_queue',
    FAILED_QUEUE_KEY: 'google_failed_queue',
    MAX_RETRY_COUNT: 10,
    
    // Token Management Constants
    TOKEN_EXPIRY_KEY: 'google_token_expiry',
    LAST_SYNC_KEY: 'google_last_sync',
    CONNECTED_KEY: 'google_connected',
    TOKEN_REFRESH_BUFFER: 5 * 60 * 1000, // 5 minutes in milliseconds
  };

  // Legacy global function wrappers for backward compatibility
  window.gapiLoaded = function() {
    gapi.load("client", async () => {
      await gapi.client.init({
        discoveryDocs: [
          "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
        ],
      });
      console.log("GAPI Ready");
    });
  };

  window.gsiLoaded = function() {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: "",
    });
    window.tokenClient = tokenClient; // Make accessible to APP.cloud
    console.log("GSI Ready");
  };

  window.triggerManualDownload = function(jsonString) {
    const blob = new Blob([jsonString], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup_cloud_fisik_${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  window.syncToCloud = async function() {
    tokenClient.callback = async (resp) => {
      if (resp.error !== undefined) throw resp;
      
      // Store token expiry timestamp (Sprint 1.3.C)
      if (resp.expires_in) {
        const expiryTime = new Date(
          Date.now() + (resp.expires_in * 1000)
        ).toISOString();
        
        window.LS_SAFE.set(
          window.APP.cloud.TOKEN_EXPIRY_KEY,
          expiryTime
        );
        
        window.LS_SAFE.set(
          window.APP.cloud.CONNECTED_KEY,
          'true'
        );
        
        console.log("[TOKEN] Token expires at:", expiryTime);
      }
      
      const backupData = {};
      let itemCount = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith("gapi") || key.startsWith("google")) continue;
        backupData[key] = localStorage.getItem(key);
        itemCount++;
      }
      if (itemCount === 0) {
        if (!confirm("⚠️ Data lokal 0 item. Lanjutkan Backup?")) return;
      }
      const rawData = JSON.stringify(backupData);
      const fileName = "the-grind-design-backup.json";
      const accessToken = gapi.client.getToken().access_token;
      try {
        const search = await gapi.client.drive.files.list({
          q: `name = '${fileName}'`,
          spaces: "appDataFolder",
          fields: "files(id)",
        });
        let fileId;
        if (search.result.files.length > 0) {
          fileId = search.result.files[0].id;
          console.log("File ditemukan, ID:", fileId);
        } else {
          console.log("File tidak ada, membuat wadah baru...");
          const createRes = await fetch(
            "https://www.googleapis.com/drive/v3/files",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: fileName,
                parents: ["appDataFolder"],
              }),
            }
          );
          const createJson = await createRes.json();
          fileId = createJson.id;
        }
        console.log("Mengupload konten ke ID:", fileId);
        const uploadRes = await fetch(
          `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: rawData,
          }
        );
        if (!uploadRes.ok)
          throw new Error(`Upload Gagal: ${uploadRes.status}`);
        alert(
          `✅ Backup Sukses! ${itemCount} item data diamankan di Cloud.`
        );
      } catch (err) {
        console.error("BACKUP ERROR:", err);
        alert(`❌ Gagal Backup: ${err.message}`);
      }
    };
    tokenClient.requestAccessToken({
      prompt: "",
    });
  };

  window.restoreFromCloud = async function() {
    tokenClient.callback = async (resp) => {
      if (resp.error !== undefined) throw resp;
      
      // Store token expiry timestamp (Sprint 1.3.C)
      if (resp.expires_in) {
        const expiryTime = new Date(
          Date.now() + (resp.expires_in * 1000)
        ).toISOString();
        
        window.LS_SAFE.set(
          window.APP.cloud.TOKEN_EXPIRY_KEY,
          expiryTime
        );
        
        window.LS_SAFE.set(
          window.APP.cloud.CONNECTED_KEY,
          'true'
        );
        
        console.log("[TOKEN] Token expires at:", expiryTime);
      }
      
      try {
        const search = await gapi.client.drive.files.list({
          q: "name = 'the-grind-design-backup.json'",
          spaces: "appDataFolder",
        });
        if (search.result.files.length === 0) {
          alert("Tidak ada backup di Cloud.");
          return;
        }
        const fileId = search.result.files[0].id;
        if (!confirm("PERINGATAN: Data HP akan DITIMPA. Lanjutkan?"))
          return;
        const accessToken = gapi.client.getToken().access_token;
        const response = await fetch(
          `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const rawText = await response.text();
        if (!rawText || rawText.length < 5) {
          alert("⚠️ File Cloud Kosong (Zombie). Silakan Backup ulang.");
          return;
        }
        triggerManualDownload(rawText);
        let cloudData;
        try {
          cloudData = JSON.parse(rawText);
        } catch (e) {
          alert("Format JSON Rusak.");
          return;
        }
        if (typeof cloudData === "string") {
          try {
            cloudData = JSON.parse(cloudData);
          } catch (e) {}
        }
        localStorage.clear();
        let restoreCount = 0;
        for (const key in cloudData) {
          if (cloudData.hasOwnProperty(key)) {
            let val = cloudData[key];
            if (typeof val === "object") val = JSON.stringify(val);
            localStorage.setItem(key, val);
            restoreCount++;
          }
        }
        setTimeout(() => {
          alert(
            `✅ Restore Berhasil! File backup juga telah didownload ke perangkat Anda.\nAplikasi akan dimuat ulang...`
          );
          location.reload();
        }, 1000);
      } catch (err) {
        console.error("RESTORE ERROR:", err);
        alert(`❌ Error: ${err.message}`);
      }
    };
    tokenClient.requestAccessToken({
      prompt: "",
    });
  };

  // Initialize on load
  window.addEventListener("load", () => {
    gapiLoaded();
    gsiLoaded();
  });

  // ============================================
  // SPRINT 1.1.C - Scope Validation
  // ============================================
  
  /**
   * Validates that the current token has all required scopes
   * @returns {boolean} True if all scopes present, false otherwise
   */
  window.APP.cloud.validateScopes = function() {
    try {
      const tokenClient = window.tokenClient;
      if (!tokenClient) {
        console.error("[CLOUD] Token client not initialized");
        return false;
      }
      
      // Get current token scopes (implementation depends on GIS response)
      // For Phase 1, we trust that initTokenClient requested all scopes
      // Full validation will be added when we make actual API calls in Phase 2
      
      return true; // Placeholder for Phase 1
    } catch (e) {
      console.error("[CLOUD] Scope validation error:", e);
      return false;
    }
  };

  // ============================================
  // SPRINT 1.2 - Queue Manager
  // ============================================
  
  /**
   * Queue Manager - Handles offline sync queue
   */
  window.APP.cloud.queue = {
    /**
     * Add workout to sync queue
     * @param {string} workoutId - Workout ID from gym_hist
     * @param {string} operation - Type: 'sheets_append', 'tasks_create', 'calendar_event'
     * @param {string} originalDate - ISO date string of original workout
     */
    add: function(workoutId, operation, originalDate) {
      try {
        // Get current queue
        const queue = window.LS_SAFE.getJSON(
          window.APP.cloud.QUEUE_STORAGE_KEY, 
          []
        );
        
        // Check for duplicates (same workoutId + operation)
        const exists = queue.some(item => 
          item.id === workoutId && item.operation === operation
        );
        
        if (exists) {
          console.log(`[QUEUE] Item already in queue: ${workoutId} - ${operation}`);
          return false;
        }
        
        // Create queue entry
        const entry = {
          id: workoutId,
          operation: operation,
          created_at: new Date().toISOString(),
          retry_count: 0,
          original_date: originalDate
        };
        
        // Add to queue
        queue.push(entry);
        
        // Save to localStorage
        window.LS_SAFE.setJSON(
          window.APP.cloud.QUEUE_STORAGE_KEY, 
          queue
        );
        
        console.log(`[QUEUE] Added: ${workoutId} - ${operation}`);
        return true;
        
      } catch (e) {
        console.error("[QUEUE] Error adding to queue:", e);
        return false;
      }
    },
    
    /**
     * Remove item from queue by workout ID and operation
     * @param {string} workoutId - Workout ID
     * @param {string} operation - Operation type
     */
    remove: function(workoutId, operation) {
      try {
        const queue = window.LS_SAFE.getJSON(
          window.APP.cloud.QUEUE_STORAGE_KEY, 
          []
        );
        
        // Filter out the matching item
        const newQueue = queue.filter(item => 
          !(item.id === workoutId && item.operation === operation)
        );
        
        // Save updated queue
        window.LS_SAFE.setJSON(
          window.APP.cloud.QUEUE_STORAGE_KEY, 
          newQueue
        );
        
        console.log(`[QUEUE] Removed: ${workoutId} - ${operation}`);
        return true;
        
      } catch (e) {
        console.error("[QUEUE] Error removing from queue:", e);
        return false;
      }
    },
    
    /**
     * Get all queue entries
     * @returns {Array} Queue entries
     */
    get: function() {
      return window.LS_SAFE.getJSON(
        window.APP.cloud.QUEUE_STORAGE_KEY, 
        []
      );
    },
    
    /**
     * Clear entire queue (emergency use only)
     */
    clear: function() {
      try {
        window.LS_SAFE.setJSON(
          window.APP.cloud.QUEUE_STORAGE_KEY, 
          []
        );
        console.log("[QUEUE] Cleared all entries");
        return true;
      } catch (e) {
        console.error("[QUEUE] Error clearing queue:", e);
        return false;
      }
    },
    
    /**
     * Get queue count (for UI display)
     * @returns {number} Number of items in queue
     */
    count: function() {
      const queue = this.get();
      return queue.length;
    }
  };

  // ============================================
  // SPRINT 1.2.C - Original Date Extractor
  // ============================================
  
  /**
   * Extract original workout date from gym_hist entry
   * @param {string} workoutId - Workout ID
   * @returns {string} ISO date string (YYYY-MM-DD) or current date if not found
   */
  window.APP.cloud.getOriginalWorkoutDate = function(workoutId) {
    try {
      // Get workout logs from localStorage
      const workoutLogs = window.LS_SAFE.getJSON('gym_hist', []);
      
      // Find the workout by ID
      const workout = workoutLogs.find(log => log.id === workoutId);
      
      if (!workout || !workout.date) {
        console.warn(`[CLOUD] Workout date not found for ID: ${workoutId}`);
        // Fallback to current date
        return new Date().toISOString().split('T')[0];
      }
      
      // Return the original date (format: YYYY-MM-DD)
      return workout.date;
      
    } catch (e) {
      console.error("[CLOUD] Error extracting workout date:", e);
      // Fallback to current date
      return new Date().toISOString().split('T')[0];
    }
  };

  // ============================================
  // SPRINT 1.3 - Token Lifecycle Manager
  // ============================================
  
  /**
   * Token Lifecycle Manager
   */
  window.APP.cloud.token = {
    /**
     * Check if current token is valid (not expired)
     * @returns {boolean} True if valid, false if expired or missing
     */
    isValid: function() {
      try {
        const expiryTimestamp = window.LS_SAFE.get(
          window.APP.cloud.TOKEN_EXPIRY_KEY,
          null
        );
        
        if (!expiryTimestamp) {
          console.log("[TOKEN] No expiry timestamp found");
          return false;
        }
        
        const now = Date.now();
        const expiry = new Date(expiryTimestamp).getTime();
        
        const isValid = now < expiry;
        
        if (!isValid) {
          console.log("[TOKEN] Token expired");
        }
        
        return isValid;
        
      } catch (e) {
        console.error("[TOKEN] Error checking validity:", e);
        return false;
      }
    },
    
    /**
     * Check if token should be refreshed (within 5 minutes of expiry)
     * @returns {boolean} True if refresh recommended
     */
    shouldRefresh: function() {
      try {
        const expiryTimestamp = window.LS_SAFE.get(
          window.APP.cloud.TOKEN_EXPIRY_KEY,
          null
        );
        
        if (!expiryTimestamp) {
          return false;
        }
        
        const now = Date.now();
        const expiry = new Date(expiryTimestamp).getTime();
        const bufferTime = window.APP.cloud.TOKEN_REFRESH_BUFFER;
        
        // Should refresh if within buffer time of expiry
        return (expiry - now) < bufferTime;
        
      } catch (e) {
        console.error("[TOKEN] Error checking refresh need:", e);
        return false;
      }
    },
    
    /**
     * Refresh OAuth token
     * @returns {Promise<boolean>} True if refresh successful
     */
    refresh: async function() {
      try {
        console.log("[TOKEN] Attempting token refresh...");
        
        // Check if token client is initialized
        if (!window.tokenClient) {
          console.error("[TOKEN] Token client not initialized");
          return false;
        }
        
        // Request new token (GIS will handle refresh automatically)
        return new Promise((resolve) => {
          window.tokenClient.requestAccessToken({
            prompt: '', // Empty prompt = silent refresh if possible
            callback: (response) => {
              if (response.error) {
                console.error("[TOKEN] Refresh failed:", response.error);
                
                // CRITICAL: Handle revocation edge case
                if (response.error === 'access_denied') {
                  console.warn("[TOKEN] Access revoked externally - prompting re-auth");
                  window.LS_SAFE.set(window.APP.cloud.CONNECTED_KEY, 'false');
                }
                
                resolve(false);
                return;
              }
              
              // Calculate expiry (GIS tokens typically last 3600 seconds)
              const expiryTime = new Date(
                Date.now() + (response.expires_in * 1000)
              ).toISOString();
              
              // Store expiry timestamp
              window.LS_SAFE.set(
                window.APP.cloud.TOKEN_EXPIRY_KEY,
                expiryTime
              );
              
              console.log("[TOKEN] Refresh successful, expires at:", expiryTime);
              resolve(true);
            }
          });
        });
        
      } catch (e) {
        console.error("[TOKEN] Refresh error:", e);
        return false;
      }
    },
    
    /**
     * Proactive token check before API calls
     * @returns {Promise<boolean>} True if token ready, false if unavailable
     */
    ensureValid: async function() {
      // Check if connected
      const connected = window.LS_SAFE.get(
        window.APP.cloud.CONNECTED_KEY,
        'false'
      ) === 'true';
      
      if (!connected) {
        console.log("[TOKEN] Not connected to Google");
        return false;
      }
      
      // Check if should refresh
      if (this.shouldRefresh()) {
        console.log("[TOKEN] Proactive refresh triggered");
        const refreshed = await this.refresh();
        return refreshed;
      }
      
      // Check if valid
      if (!this.isValid()) {
        console.log("[TOKEN] Token invalid, attempting refresh");
        const refreshed = await this.refresh();
        return refreshed;
      }
      
      // Token is valid
      return true;
    }
  };

  // ============================================
  // SPRINT 1.4 - Smart Dating Integration
  // ============================================
  
  /**
   * Format date for Google API payloads
   * @param {string} dateString - Date in YYYY-MM-DD format
   * @returns {Object} Formatted date object for Google APIs
   */
  window.APP.cloud.formatDateForAPI = function(dateString) {
    try {
      // Parse the date string
      const [year, month, day] = dateString.split('-').map(Number);
      
      // Return formatted object
      return {
        // For Google Sheets (string format)
        sheets: dateString,
        
        // For Google Calendar (RFC3339 format with time)
        calendar: `${dateString}T12:00:00Z`,
        
        // For tasks (ISO format)
        tasks: new Date(year, month - 1, day).toISOString(),
        
        // Raw components (if needed)
        year: year,
        month: month,
        day: day
      };
      
    } catch (e) {
      console.error("[CLOUD] Date formatting error:", e);
      
      // Fallback to current date
      const now = new Date();
      const fallback = now.toISOString().split('T')[0];
      
      return {
        sheets: fallback,
        calendar: `${fallback}T12:00:00Z`,
        tasks: now.toISOString(),
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate()
      };
    }
  };

  // ============================================
  // SPRINT 1.5 - Queue Processing Engine
  // ============================================
  
  /**
   * Process sync queue (auto-run on app load)
   * Implements exponential backoff and rate limiting
   */
  window.APP.cloud.processQueue = async function() {
    try {
      console.log("[QUEUE] Processing queue...");
      
      // Check if connected
      const connected = window.LS_SAFE.get(
        this.CONNECTED_KEY,
        'false'
      ) === 'true';
      
      if (!connected) {
        console.log("[QUEUE] Not connected, skipping queue processing");
        return;
      }
      
      // Ensure token is valid before processing
      const tokenReady = await this.token.ensureValid();
      if (!tokenReady) {
        console.warn("[QUEUE] Token not ready, queue processing aborted");
        return;
      }
      
      // Get queue
      const queue = this.queue.get();
      
      if (queue.length === 0) {
        console.log("[QUEUE] Queue is empty");
        return;
      }
      
      console.log(`[QUEUE] Processing ${queue.length} items...`);
      
      // Process each item with throttle
      for (let i = 0; i < queue.length; i++) {
        const item = queue[i];
        
        console.log(`[QUEUE] Processing item ${i + 1}/${queue.length}: ${item.id} - ${item.operation}`);
        
        // Check if max retries exceeded
        if (item.retry_count >= this.MAX_RETRY_COUNT) {
          console.warn(`[QUEUE] Max retries exceeded for ${item.id}, moving to failed queue`);
          this.moveToFailedQueue(item);
          this.queue.remove(item.id, item.operation);
          continue;
        }
        
        // Calculate backoff delay (exponential)
        const backoffDelay = Math.min(
          300,  // Max 5 minutes
          Math.pow(2, item.retry_count) * 5  // 5s, 10s, 20s, 40s, 80s, ...
        );
        
        // Wait for backoff if this is a retry
        if (item.retry_count > 0) {
          console.log(`[QUEUE] Retry #${item.retry_count}, waiting ${backoffDelay}s...`);
          await this.delay(backoffDelay * 1000);
        }
        
        // Attempt sync (placeholder - actual sync logic in Phase 2)
        const success = await this.syncWorkoutToServices(item);
        
        if (success) {
          console.log(`[QUEUE] ✅ Success: ${item.id} - ${item.operation}`);
          this.queue.remove(item.id, item.operation);
        } else {
          console.warn(`[QUEUE] ❌ Failed: ${item.id} - ${item.operation}`);
          // Increment retry count
          this.incrementRetryCount(item);
        }
        
        // CRITICAL: 1-second throttle between items (rate limiting)
        if (i < queue.length - 1) {
          await this.delay(1000);
        }
      }
      
      console.log("[QUEUE] Processing complete");
      
    } catch (e) {
      console.error("[QUEUE] Error processing queue:", e);
    }
  };

  /**
   * Delay helper (for throttling)
   * @param {number} ms - Milliseconds to wait
   */
  window.APP.cloud.delay = function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  /**
   * Increment retry count for queue item
   * @param {Object} item - Queue item
   */
  window.APP.cloud.incrementRetryCount = function(item) {
    try {
      const queue = this.queue.get();
      
      // Find and update the item
      const updatedQueue = queue.map(queueItem => {
        if (queueItem.id === item.id && queueItem.operation === item.operation) {
          return {
            ...queueItem,
            retry_count: queueItem.retry_count + 1
          };
        }
        return queueItem;
      });
      
      // Save updated queue
      window.LS_SAFE.setJSON(
        this.QUEUE_STORAGE_KEY,
        updatedQueue
      );
      
      console.log(`[QUEUE] Incremented retry count for ${item.id} to ${item.retry_count + 1}`);
      
    } catch (e) {
      console.error("[QUEUE] Error incrementing retry count:", e);
    }
  };

  /**
   * Move item to failed queue (after max retries)
   * @param {Object} item - Queue item
   */
  window.APP.cloud.moveToFailedQueue = function(item) {
    try {
      const failedQueue = window.LS_SAFE.getJSON(
        this.FAILED_QUEUE_KEY,
        []
      );
      
      // Add timestamp of failure
      const failedItem = {
        ...item,
        failed_at: new Date().toISOString()
      };
      
      failedQueue.push(failedItem);
      
      window.LS_SAFE.setJSON(
        this.FAILED_QUEUE_KEY,
        failedQueue
      );
      
      console.log(`[QUEUE] Moved to failed queue: ${item.id}`);
      
    } catch (e) {
      console.error("[QUEUE] Error moving to failed queue:", e);
    }
  };

  /**
   * Sync workout to Google services (placeholder for Phase 2)
   * @param {Object} item - Queue item
   * @returns {Promise<boolean>} True if successful
   */
  window.APP.cloud.syncWorkoutToServices = async function(item) {
    // PLACEHOLDER: Actual implementation in Phase 2
    // For Phase 1, we simulate success/failure for testing
    
    console.log(`[SYNC] Simulating sync for ${item.id} - ${item.operation}`);
    console.log(`[SYNC] Original date: ${item.original_date}`);
    
    // Simulate API call delay
    await this.delay(100);
    
    // For testing: Always return true in Phase 1
    // In Phase 2, this will contain actual Sheets/Tasks/Calendar API calls
    return true;
  };

  // Initialize on load
  window.addEventListener("load", () => {
    gapiLoaded();
    gsiLoaded();
  });

  console.log("[CLOUD] ✅ Google Drive backup/restore loaded");
})();
