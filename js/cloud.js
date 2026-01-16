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
    
    // Sheets Integration Keys (V31 Phase 2)
    SHEET_ID_KEY: 'google_sheet_id',
    SYNCED_WORKOUTS_KEY: 'google_synced_workouts',
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
  // GOOGLE SHEETS INTEGRATION (V31 Phase 2 - REVISED)
  // ============================================
  
  /**
   * Google Sheets Integration (V31 Phase 2 - REVISED)
   * Manages single master spreadsheet for workout data warehouse
   * Schema: 13 columns (A:M) including exercise metadata
   */
  window.APP.cloud.sheets = {
    /**
     * Create master spreadsheet in user's Drive root folder
     * @returns {Promise<string|null>} Spreadsheet ID or null if failed
     */
    createMasterSheet: async function() {
      try {
        console.log("[SHEETS] Creating master spreadsheet...");
        
        // Ensure token is valid
        const tokenReady = await window.APP.cloud.token.ensureValid();
        if (!tokenReady) {
          console.error("[SHEETS] Token not ready");
          return null;
        }
        
        // Get access token from GIS with defensive checks
        if (!gapi || !gapi.client || !gapi.client.getToken || !gapi.client.getToken()) {
          console.error("[SHEETS] Token not available");
          return null;
        }
        
        const accessToken = gapi.client.getToken().access_token;
        
        // Create spreadsheet metadata
        const metadata = {
          properties: {
            title: window.SHEET_NAME
          },
          sheets: [{
            properties: {
              title: "Resistance Log",
              gridProperties: {
                frozenRowCount: 1  // Freeze header row
              }
            }
          }]
        };
        
        // Call Sheets API to create spreadsheet (in root folder)
        const response = await fetch(
          'https://sheets.googleapis.com/v4/spreadsheets',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(metadata)
          }
        );
        
        if (!response.ok) {
          const error = await response.json();
          console.error("[SHEETS] Create failed:", error);
          return null;
        }
        
        const data = await response.json();
        const spreadsheetId = data.spreadsheetId;
        const spreadsheetUrl = data.spreadsheetUrl;
        
        console.log("[SHEETS] ✅ Created:", spreadsheetId);
        console.log("[SHEETS] URL:", spreadsheetUrl);
        
        // Store spreadsheet ID in localStorage
        window.LS_SAFE.set(
          window.APP.cloud.SHEET_ID_KEY,
          spreadsheetId
        );
        
        // Add header row (13 columns: A:M)
        await this.addHeaderRow(spreadsheetId);
        
        return spreadsheetId;
        
      } catch (e) {
        console.error("[SHEETS] Create error:", e);
        return null;
      }
    },
    
    /**
     * Add header row to spreadsheet (13 columns: A:M)
     * @param {string} spreadsheetId - Spreadsheet ID
     * @returns {Promise<boolean>} Success status
     */
    addHeaderRow: async function(spreadsheetId) {
      try {
        console.log("[SHEETS] Adding header row (13 columns)...");
        
        // Check if gapi.client is initialized and has token
        if (!gapi || !gapi.client || !gapi.client.getToken || !gapi.client.getToken()) {
          console.error("[SHEETS] Token not available");
          return false;
        }
        
        const accessToken = gapi.client.getToken().access_token;
        
        // Prepare header row (13 columns from constants.js)
        const values = [window.SHEET_HEADERS];
        
        // Update to A1:M1 (13 columns)
        const response = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:M1?valueInputOption=RAW`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ values })
          }
        );
        
        if (!response.ok) {
          const error = await response.json();
          console.error("[SHEETS] Header add failed:", error);
          return false;
        }
        
        console.log("[SHEETS] ✅ Header row added (A:M)");
        return true;
        
      } catch (e) {
        console.error("[SHEETS] Header error:", e);
        return false;
      }
    },
    
    /**
     * Validate that spreadsheet exists and is accessible
     * @returns {Promise<boolean>} True if valid, false if not found
     */
    validateSheet: async function() {
      try {
        const spreadsheetId = window.LS_SAFE.get(
          window.APP.cloud.SHEET_ID_KEY,
          null
        );
        
        if (!spreadsheetId) {
          console.log("[SHEETS] No sheet ID stored");
          return false;
        }
        
        console.log("[SHEETS] Validating sheet:", spreadsheetId);
        
        // Ensure token is valid
        const tokenReady = await window.APP.cloud.token.ensureValid();
        if (!tokenReady) {
          console.error("[SHEETS] Token not ready for validation");
          return false;
        }
        
        // Check if gapi.client is initialized and has token
        if (!gapi || !gapi.client || !gapi.client.getToken || !gapi.client.getToken()) {
          console.error("[SHEETS] Token not available");
          return false;
        }
        
        const accessToken = gapi.client.getToken().access_token;
        
        // Check if sheet exists (minimal fields request)
        const response = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=spreadsheetId`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
        
        if (response.status === 404) {
          console.warn("[SHEETS] Sheet not found (404) - was deleted");
          // Clear stored ID
          window.LS_SAFE.set(window.APP.cloud.SHEET_ID_KEY, null);
          return false;
        }
        
        if (!response.ok) {
          const error = await response.json();
          console.error("[SHEETS] Validation failed:", error);
          return false;
        }
        
        console.log("[SHEETS] ✅ Sheet valid");
        return true;
        
      } catch (e) {
        console.error("[SHEETS] Validation error:", e);
        return false;
      }
    },
    
    /**
     * Get or create master spreadsheet
     * Ensures a valid spreadsheet exists, creating if needed
     * @returns {Promise<string|null>} Spreadsheet ID or null
     */
    getOrCreateSheet: async function() {
      try {
        // Check if sheet ID exists
        const existingId = window.LS_SAFE.get(
          window.APP.cloud.SHEET_ID_KEY,
          null
        );
        
        if (existingId) {
          // Validate it still exists
          const valid = await this.validateSheet();
          if (valid) {
            console.log("[SHEETS] Using existing sheet:", existingId);
            return existingId;
          }
          
          console.log("[SHEETS] Existing sheet invalid, creating new...");
        }
        
        // Create new sheet
        const newId = await this.createMasterSheet();
        return newId;
        
      } catch (e) {
        console.error("[SHEETS] Get/create error:", e);
        return null;
      }
    },
    
    /**
     * Get exercise metadata from EXERCISE_TARGETS and name-based detection
     * @param {string} exerciseName - Exercise name
     * @returns {Object} Metadata {type, pattern, equipment, isBodyweight, multiplier, isDuration}
     */
    getExerciseMetadata: function(exerciseName) {
      try {
        // Default metadata if not found
        const defaultMeta = {
          type: "Unknown",
          pattern: "N/A",
          equipment: "Unknown",
          isBodyweight: false,
          multiplier: 0,
          isDuration: false
        };
        
        // Always use name-based detection (works without external data)
        const metadata = {
          type: this.detectExerciseType(null, exerciseName),
          pattern: this.detectMovementPattern(null, exerciseName),
          equipment: this.detectEquipment(exerciseName),
          isBodyweight: this.isBodyweightExercise(exerciseName),
          multiplier: this.getBodyweightMultiplier(exerciseName),
          isDuration: this.isDurationExercise(exerciseName)
        };
        
        // Check if exercise exists in EXERCISE_TARGETS (validates it's a known exercise)
        if (window.EXERCISE_TARGETS && window.EXERCISE_TARGETS[exerciseName]) {
          console.log(`[SHEETS] Exercise found in EXERCISE_TARGETS: ${exerciseName}`);
        }
        
        return metadata;
        
      } catch (e) {
        console.error("[SHEETS] Metadata extraction error:", e);
        return {
          type: "Unknown",
          pattern: "N/A",
          equipment: "Unknown",
          isBodyweight: false,
          multiplier: 0,
          isDuration: false
        };
      }
    },
    
    /**
     * Check if exercise is bodyweight-based
     * @param {string} name - Exercise name
     * @returns {boolean} True if bodyweight
     */
    isBodyweightExercise: function(name) {
      const nameLower = name.toLowerCase();
      const bodyweightKeywords = ['[bodyweight]', '[bw]', 'pull-up', 'chin-up', 'push-up', 'dip', 'plank', 'handstand', 'pistol'];
      
      for (const keyword of bodyweightKeywords) {
        if (nameLower.includes(keyword)) return true;
      }
      
      return false;
    },
    
    /**
     * Get bodyweight multiplier for volume calculation
     * Uses pattern matching similar to stats.js BODYWEIGHT_LOAD_MULTIPLIERS
     * @param {string} name - Exercise name
     * @returns {number} Multiplier (0 if not bodyweight exercise)
     */
    getBodyweightMultiplier: function(name) {
      if (!this.isBodyweightExercise(name)) return 0;
      
      const nameLower = name.toLowerCase();
      
      // Pattern matching (simplified version of BODYWEIGHT_LOAD_MULTIPLIERS)
      const patterns = {
        'pull.*up|chin.*up': 1.00,
        'muscle.*up': 1.10,
        'dip': 0.78,
        'ring.*dip': 0.82,
        'push.*up': 0.64,
        'pike.*push|decline.*push': 0.70,
        'diamond.*push': 0.68,
        'archer.*push': 0.80,
        'planche': 0.85,
        'inverted.*row': 0.60,
        'pistol.*squat': 1.00,
        'single.*leg.*squat': 0.90
      };
      
      // Try pattern matching
      for (const [pattern, multiplier] of Object.entries(patterns)) {
        const regex = new RegExp(pattern, 'i');
        if (regex.test(nameLower)) {
          return multiplier;
        }
      }
      
      // Default multiplier for unrecognized bodyweight exercises
      return 0.70;
    },
    
    /**
     * Detect exercise type (Compound/Isolation/Cardio)
     * @param {Object} exerciseData - Exercise object from library
     * @param {string} name - Exercise name
     * @returns {string} Exercise type
     */
    detectExerciseType: function(exerciseData, name) {
      // Check for cardio first
      const nameLower = name.toLowerCase();
      if (nameLower.includes('cardio') || nameLower.includes('running') || 
          nameLower.includes('cycling') || nameLower.includes('rowing')) {
        return "Cardio";
      }
      
      // Check exercise data properties (only if exerciseData exists)
      if (exerciseData) {
        if (exerciseData.compound === true) return "Compound";
        if (exerciseData.isolation === true) return "Isolation";
        if (exerciseData.type === "compound") return "Compound";
        if (exerciseData.type === "isolation") return "Isolation";
      }
      
      // Heuristics based on name
      const compoundKeywords = ['squat', 'deadlift', 'bench', 'press', 'row', 'pull-up', 'chin-up'];
      const isolationKeywords = ['curl', 'extension', 'raise', 'fly', 'isolation'];
      
      for (const keyword of compoundKeywords) {
        if (nameLower.includes(keyword)) return "Compound";
      }
      
      for (const keyword of isolationKeywords) {
        if (nameLower.includes(keyword)) return "Isolation";
      }
      
      return "Unknown";
    },
    
    /**
     * Detect movement pattern (Unilateral/Bilateral/N/A)
     * @param {Object} exerciseData - Exercise object from library
     * @param {string} name - Exercise name
     * @returns {string} Movement pattern
     */
    detectMovementPattern: function(exerciseData, name) {
      // Check exercise data properties (only if exerciseData exists)
      if (exerciseData) {
        if (exerciseData.unilateral === true) return "Unilateral";
        if (exerciseData.bilateral === true) return "Bilateral";
        if (exerciseData.pattern === "unilateral") return "Unilateral";
        if (exerciseData.pattern === "bilateral") return "Bilateral";
      }
      
      // Heuristics based on name
      const nameLower = name.toLowerCase();
      const unilateralKeywords = ['single', 'one-arm', 'one-leg', 'unilateral', 'pistol', 'lunge', 'split'];
      
      for (const keyword of unilateralKeywords) {
        if (nameLower.includes(keyword)) return "Unilateral";
      }
      
      // Default to bilateral for most barbell/machine exercises
      if (nameLower.includes('barbell') || nameLower.includes('machine')) {
        return "Bilateral";
      }
      
      return "N/A";
    },
    
    /**
     * Detect equipment type from exercise name
     * @param {string} name - Exercise name
     * @returns {string} Equipment type
     */
    detectEquipment: function(name) {
      const nameLower = name.toLowerCase();
      
      // Check for tagged equipment (e.g., "[Barbell] Bench Press")
      if (name.includes('[Barbell]') || nameLower.includes('barbell')) return "Barbell";
      if (name.includes('[Dumbbell]') || nameLower.includes('dumbbell') || nameLower.includes(' db ')) return "Dumbbell";
      if (name.includes('[Cable]') || nameLower.includes('cable')) return "Cable";
      if (name.includes('[Machine]') || nameLower.includes('machine')) return "Machine";
      if (name.includes('[Bodyweight]')) return "Bodyweight";
      
      // Heuristics for bodyweight exercises
      const bodyweightKeywords = ['pull-up', 'chin-up', 'push-up', 'dip', 'plank', 'handstand', 'pistol'];
      for (const keyword of bodyweightKeywords) {
        if (nameLower.includes(keyword)) return "Bodyweight";
      }
      
      return "Unknown";
    },
    
    /**
     * Check if exercise is duration-based (e.g., Plank, Dead Hang)
     * @param {string} name - Exercise name
     * @returns {boolean} True if duration-based
     */
    isDurationExercise: function(name) {
      const nameLower = name.toLowerCase();
      const durationKeywords = ['plank', 'hold', 'hang', 'wall sit', 'l-sit', 'hollow'];
      
      for (const keyword of durationKeywords) {
        if (nameLower.includes(keyword)) return true;
      }
      
      return false;
    },
    
    /**
     * Extract workout data from gym_hist for Sheets formatting
     * REVISED: 13 columns with metadata, cardio filtering, bodyweight/duration logic
     * @param {string} workoutId - Workout ID (format: date_sessionId_timestamp)
     * @param {string} originalDate - Original workout date (YYYY-MM-DD)
     * @returns {Array<Array>} Array of row arrays, one per exercise
     */
    extractWorkoutData: function(workoutId, originalDate) {
      try {
        console.log(`[SHEETS] Extracting data for workout: ${workoutId}`);
        
        // Parse workoutId to get date, sessionId, and timestamp
        const parts = workoutId.split('_');
        const targetDate = parts[0];  // YYYY-MM-DD
        const sessionId = parts[1];   // s1, s2, etc.
        const targetTimestamp = parseInt(parts[2]) || 0;
        
        // Get all workout logs from gym_hist
        const workoutLogs = window.LS_SAFE.getJSON('gym_hist', []);
        
        // Filter exercises from this specific workout session
        // Match by date and timestamp (or close timestamp within 1 minute)
        const exercises = workoutLogs.filter(log => {
          if (log.date !== targetDate) return false;
          if (log.src !== sessionId && sessionId !== 'spontaneous') return false;
          
          // If we have a timestamp, match within 1 minute window
          if (targetTimestamp > 0) {
            const timeDiff = Math.abs(log.ts - targetTimestamp);
            return timeDiff < 60000; // 60 seconds tolerance
          }
          
          return true;
        });
        
        if (exercises.length === 0) {
          console.warn("[SHEETS] No exercises found for workout");
          return [];
        }
        
        // Get day of week from date
        const dayOfWeek = this.getDayOfWeek(originalDate);
        
        // Get session name (from first exercise's title)
        const sessionName = exercises[0].title || "Spontaneous Workout";
        
        // Convert each exercise to a row (FILTER OUT CARDIO)
        const rows = [];
        
        for (const exercise of exercises) {
          // Skip cardio exercises
          if (exercise.type === "cardio") {
            console.log(`[SHEETS] Skipping cardio exercise: ${exercise.ex}`);
            continue;
          }
          
          // Get exercise metadata
          const metadata = this.getExerciseMetadata(exercise.ex);
          
          // CRITICAL: Skip cardio exercises detected by metadata
          if (metadata.type === "Cardio") {
            console.log(`[SHEETS] Skipping cardio exercise: ${exercise.ex}`);
            continue;
          }
          
          // Format exercise as 13-column row
          const row = this.formatExerciseRow(
            originalDate,
            dayOfWeek,
            sessionName,
            exercise,
            metadata
          );
          
          if (row) {
            rows.push(row);
          }
        }
        
        console.log(`[SHEETS] Extracted ${rows.length} rows (cardio excluded)`);
        return rows;
        
      } catch (e) {
        console.error("[SHEETS] Extraction error:", e);
        return [];
      }
    },
    
    /**
     * Format single exercise as 13-column sheet row
     * REVISED: Includes metadata, bodyweight volume, duration handling
     * Works with gym_hist log structure
     * @param {string} date - YYYY-MM-DD
     * @param {string} day - Day of week
     * @param {string} sessionName - Session name
     * @param {Object} exercise - Exercise log from gym_hist
     * @param {Object} metadata - Exercise metadata
     * @returns {Array|null} Row array (13 elements) or null if invalid
     */
    formatExerciseRow: function(date, day, sessionName, exercise, metadata) {
      try {
        // gym_hist structure:
        // { type: "strength", date, ts, ex (exercise name), vol, top, d (sets array), src, title, dur, note }
        const exerciseName = exercise.ex || "Unknown Exercise";
        const sets = exercise.d || [];  // d = details (sets array)
        
        if (sets.length === 0) {
          console.warn(`[SHEETS] No sets for ${exerciseName}`);
          return null;
        }
        
        // Initialize variables
        let repsArray = [];
        let weightArray = [];
        let totalVolume = exercise.vol || 0;  // Use pre-calculated volume from gym_hist
        let totalDuration = exercise.dur || 0;  // Use duration from gym_hist (for time-based exercises)
        
        // Handle duration-based vs standard exercises
        if (metadata.isDuration || totalDuration > 0) {
          // DURATION EXERCISE (e.g., Plank)
          console.log(`[SHEETS] Duration exercise: ${exerciseName}`);
          
          // For duration exercises: Reps = 0, Weight = 0
          repsArray = sets.map(() => 0);
          weightArray = sets.map(() => 0);
          totalVolume = 0;  // Duration exercises have no volume
          
        } else if (metadata.isBodyweight) {
          // BODYWEIGHT EXERCISE (use multiplier for volume)
          console.log(`[SHEETS] Bodyweight exercise: ${exerciseName}, multiplier: ${metadata.multiplier}`);
          
          // Get user bodyweight with fallback
          const profile = window.LS_SAFE.getJSON('profile', {});
          const userBodyweight = parseFloat(profile.bodyweight) || 70; // Default to 70kg
          
          if (!profile.bodyweight) {
            console.warn(`[SHEETS] Bodyweight not set in profile, using default 70kg for ${exerciseName}`);
          }
          
          // Extract reps from sets (gym_hist format: {k, r, rpe, e, note})
          totalVolume = 0;  // Recalculate volume for bodyweight
          for (const set of sets) {
            const reps = set.r || 0;  // r = reps
            repsArray.push(reps);
            weightArray.push(0); // Weight column shows 0 for bodyweight
            
            const setVolume = userBodyweight * metadata.multiplier * reps;
            totalVolume += setVolume;
          }
          
        } else {
          // STANDARD WEIGHTED EXERCISE
          // Extract from gym_hist format: {k (weight), r (reps), rpe, e (rir), note}
          for (const set of sets) {
            const reps = set.r || 0;
            const weight = set.k || 0;  // k = kilograms (weight)
            
            repsArray.push(reps);
            weightArray.push(weight);
          }
          // Use pre-calculated volume from gym_hist
        }
        
        // Build CSV strings
        const repsCSV = repsArray.join(',');
        const weightCSV = weightArray.join(',');
        
        // Extract notes (RPE from last set, plus exercise note)
        const notes = this.extractNotes(exercise, sets);
        
        // Return 13-column row: [A, B, C, D, E, F, G, H, I, J, K, L, M]
        return [
          date,                       // A: Date
          day,                        // B: Day
          sessionName,                // C: Session Name
          exerciseName,               // D: Exercise
          metadata.type,              // E: Exercise Type (Compound/Isolation)
          metadata.pattern,           // F: Movement Pattern (Unilateral/Bilateral/N/A)
          metadata.equipment,         // G: Equipment
          sets.length,                // H: Sets (integer)
          repsCSV,                    // I: Reps (CSV string)
          weightCSV,                  // J: Weight (CSV string)
          totalDuration,              // K: Duration in seconds (0 for standard exercises)
          totalVolume.toFixed(1),     // L: Total Volume (1 decimal)
          notes                       // M: Notes
        ];
        
      } catch (e) {
        console.error("[SHEETS] Row format error:", e);
        return null;
      }
    },
    
    /**
     * Get day of week from date string
     * @param {string} dateString - YYYY-MM-DD
     * @returns {string} Day name (Monday, Tuesday, etc.)
     */
    getDayOfWeek: function(dateString) {
      try {
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[date.getDay()];
      } catch (e) {
        console.error("[SHEETS] Day extraction error:", e);
        return "Unknown";
      }
    },
    
    /**
     * Extract notes from exercise and sets (gym_hist format)
     * @param {Object} exercise - Exercise log from gym_hist
     * @param {Array} sets - Sets array from gym_hist
     * @returns {string} Notes string
     */
    extractNotes: function(exercise, sets) {
      const notes = [];
      
      // Add RPE if available (from last set)
      const lastSet = sets[sets.length - 1];
      if (lastSet && lastSet.rpe) {
        notes.push(`RPE ${lastSet.rpe}`);
      }
      
      // Add exercise notes if available (from gym_hist note field)
      if (exercise.note && exercise.note.trim()) {
        notes.push(exercise.note.trim());
      }
      
      // Add any set notes from last set
      if (lastSet && lastSet.note && lastSet.note.trim()) {
        notes.push(lastSet.note.trim());
      }
      
      return notes.join(', ');
    },
    
    /**
     * Append workout rows to master spreadsheet (13-column format)
     * @param {string} workoutId - Workout ID
     * @param {string} originalDate - Original workout date (YYYY-MM-DD)
     * @returns {Promise<boolean>} Success status
     */
    appendWorkoutToSheet: async function(workoutId, originalDate) {
      try {
        console.log(`[SHEETS] Appending workout: ${workoutId}`);
        
        // Check if already synced (idempotency) - will add in Sprint 2.4
        if (window.APP.cloud.idempotency && window.APP.cloud.idempotency.isSynced(workoutId)) {
          console.log(`[SHEETS] Workout already synced, skipping: ${workoutId}`);
          return true;
        }
        
        // Ensure sheet exists
        const spreadsheetId = await this.getOrCreateSheet();
        if (!spreadsheetId) {
          console.error("[SHEETS] No valid spreadsheet");
          return false;
        }
        
        // Extract workout data (13-column rows)
        const rows = this.extractWorkoutData(workoutId, originalDate);
        if (rows.length === 0) {
          console.warn("[SHEETS] No data to append (possibly all cardio)");
          return false;
        }
        
        // Ensure token is valid
        const tokenReady = await window.APP.cloud.token.ensureValid();
        if (!tokenReady) {
          console.error("[SHEETS] Token not ready");
          return false;
        }
        
        // Check if gapi.client is initialized and has token
        if (!gapi || !gapi.client || !gapi.client.getToken || !gapi.client.getToken()) {
          console.error("[SHEETS] Token not available");
          return false;
        }

        const accessToken = gapi.client.getToken().access_token;
        
        // Append rows to sheet (A:M for 13 columns)
        const response = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A:M:append?valueInputOption=USER_ENTERED`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              values: rows
            })
          }
        );
        
        if (!response.ok) {
          let error;
          try {
            error = await response.json();
          } catch {
            error = { message: response.statusText };
          }
          
          console.error("[SHEETS] Append failed:", response.status, error);
          
          // Handle specific error codes
          if (response.status === 404) {
            console.warn("[SHEETS] Sheet not found (404), clearing ID");
            window.LS_SAFE.set(window.APP.cloud.SHEET_ID_KEY, null);
            
            if (window.APP.ui && window.APP.ui.showToast) {
              window.APP.ui.showToast("Spreadsheet deleted, will create new one", "warning");
            }
          } else if (response.status === 403) {
            console.error("[SHEETS] Permission denied (403)");
            if (window.APP.ui && window.APP.ui.showToast) {
              window.APP.ui.showToast("Google Sheets permission error", "error");
            }
          } else if (response.status === 429) {
            console.warn("[SHEETS] Rate limited (429), will retry");
          } else if (response.status === 401) {
            console.warn("[SHEETS] Token expired (401), refreshing");
          }
          
          return false;
        }
        
        const result = await response.json();
        console.log("[SHEETS] ✅ Appended:", result.updates.updatedRows, "rows");
        
        // Mark as synced (idempotency) - will add in Sprint 2.4
        if (window.APP.cloud.idempotency) {
          window.APP.cloud.idempotency.markAsSynced(workoutId);
        }
        
        return true;
        
      } catch (e) {
        console.error("[SHEETS] Append error:", e);
        return false;
      }
    }
  };

  // ============================================
  // IDEMPOTENCY MANAGER (V31 Phase 2)
  // ============================================
  
  /**
   * Idempotency Manager (V31 Phase 2)
   * Tracks synced workouts to prevent duplicates
   */
  window.APP.cloud.idempotency = {
    /**
     * Check if workout already synced
     * @param {string} workoutId - Workout ID
     * @returns {boolean} True if already synced
     */
    isSynced: function(workoutId) {
      try {
        const syncedWorkouts = window.LS_SAFE.getJSON(
          window.APP.cloud.SYNCED_WORKOUTS_KEY,
          {}
        );
        
        return workoutId in syncedWorkouts;
        
      } catch (e) {
        console.error("[IDEMPOTENCY] Check error:", e);
        return false;
      }
    },
    
    /**
     * Mark workout as synced
     * @param {string} workoutId - Workout ID
     * @param {number} sheetRow - Row number in sheet (optional)
     */
    markAsSynced: function(workoutId, sheetRow = null) {
      try {
        const syncedWorkouts = window.LS_SAFE.getJSON(
          window.APP.cloud.SYNCED_WORKOUTS_KEY,
          {}
        );
        
        syncedWorkouts[workoutId] = {
          synced_at: new Date().toISOString(),
          sheet_row: sheetRow,
          operation: 'sheets_append'
        };
        
        window.LS_SAFE.setJSON(
          window.APP.cloud.SYNCED_WORKOUTS_KEY,
          syncedWorkouts
        );
        
        console.log(`[IDEMPOTENCY] Marked as synced: ${workoutId}`);
        
      } catch (e) {
        console.error("[IDEMPOTENCY] Mark error:", e);
      }
    },
    
    /**
     * Clear sync status for workout (allow re-sync)
     * @param {string} workoutId - Workout ID
     */
    clearSync: function(workoutId) {
      try {
        const syncedWorkouts = window.LS_SAFE.getJSON(
          window.APP.cloud.SYNCED_WORKOUTS_KEY,
          {}
        );
        
        delete syncedWorkouts[workoutId];
        
        window.LS_SAFE.setJSON(
          window.APP.cloud.SYNCED_WORKOUTS_KEY,
          syncedWorkouts
        );
        
        console.log(`[IDEMPOTENCY] Cleared sync: ${workoutId}`);
        
      } catch (e) {
        console.error("[IDEMPOTENCY] Clear error:", e);
      }
    },
    
    /**
     * Get all synced workouts
     * @returns {Object} Synced workouts map
     */
    getSyncedWorkouts: function() {
      return window.LS_SAFE.getJSON(
        window.APP.cloud.SYNCED_WORKOUTS_KEY,
        {}
      );
    },
    
    /**
     * Clear all sync history (nuclear option)
     */
    clearAll: function() {
      try {
        window.LS_SAFE.setJSON(
          window.APP.cloud.SYNCED_WORKOUTS_KEY,
          {}
        );
        console.log("[IDEMPOTENCY] Cleared all sync history");
      } catch (e) {
        console.error("[IDEMPOTENCY] Clear all error:", e);
      }
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
  /**
   * Sync workout to Google services (Phase 2: Sheets only)
   * @param {Object} item - Queue item with {id, operation, original_date}
   * @returns {Promise<boolean>} True if successful
   */
  window.APP.cloud.syncWorkoutToServices = async function(item) {
    try {
      console.log(`[SYNC] Syncing workout: ${item.id} - ${item.operation}`);
      console.log(`[SYNC] Original date: ${item.original_date}`);
      
      // Phase 2: Only Sheets integration
      // Phase 3 will add Tasks and Calendar
      
      if (item.operation === 'sheets_append') {
        // Sync to Google Sheets (13-column format with metadata)
        const success = await this.sheets.appendWorkoutToSheet(
          item.id,
          item.original_date
        );
        
        if (success) {
          console.log(`[SYNC] ✅ Sheets sync successful: ${item.id}`);
          
          // Update last sync timestamp
          window.LS_SAFE.set(
            this.LAST_SYNC_KEY,
            new Date().toISOString()
          );
          
          // Show toast notification
          if (window.APP && window.APP.ui && window.APP.ui.showToast) {
            window.APP.ui.showToast("Synced to Google Sheets", "success");
          }
          
          return true;
        } else {
          console.warn(`[SYNC] ❌ Sheets sync failed: ${item.id}`);
          return false;
        }
      }
      
      // Other operations (tasks_create, calendar_event) in Phase 3
      console.warn(`[SYNC] Unknown operation: ${item.operation}`);
      return false;
      
    } catch (e) {
      console.error("[SYNC] Error:", e);
      return false;
    }
  };

  // Initialize on load
  window.addEventListener("load", () => {
    gapiLoaded();
    gsiLoaded();
  });

  console.log("[CLOUD] ✅ Google Drive backup/restore loaded");
})();
