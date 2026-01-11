(function() {
  'use strict';

  if (!window.APP) window.APP = {};

  // ============================================
  // APP.cardio - Cardio Exercise Management
  // ============================================

  APP.cardio = {
    setDuration: (sessionId, exerciseIdx, minutes) => {
      LS_SAFE.set(`${sessionId}_ex${exerciseIdx}_duration`, minutes);
      
      // V30.5: Update DOM directly without full re-render to prevent UI jump
      const inputEl = document.getElementById(`duration-${sessionId}-${exerciseIdx}`);
      if (inputEl && inputEl.value !== minutes.toString()) {
        inputEl.value = minutes;
      }
      
      // Update active state on preset buttons
      const card = document.getElementById(`card-${exerciseIdx}`);
      if (card) {
        const buttons = card.querySelectorAll('.duration-preset-btn');
        buttons.forEach(btn => {
          btn.classList.remove('active');
        });
        // Find and activate the clicked button
        buttons.forEach(btn => {
          if (btn.textContent.trim() === `${minutes}m`) {
            btn.classList.add('active');
          }
        });
      }
    },

    validateHR: (sessionId, exerciseIdx, hr) => {
      LS_SAFE.set(`${sessionId}_ex${exerciseIdx}_hr`, hr);

      const profile = LS_SAFE.getJSON("profile", {});
      const age = profile.a || 30;
      const maxHR = 220 - age;
      const zone2Lower = Math.round(maxHR * 0.6);
      const zone2Upper = Math.round(maxHR * 0.7);

      const statusEl = document.getElementById(
        `hr-status-${sessionId}-${exerciseIdx}`
      );
      if (!statusEl) return;

      const hrVal = parseInt(hr);
      if (!hr || isNaN(hrVal)) {
        statusEl.innerHTML = `Target: ${zone2Lower}-${zone2Upper} bpm (Zone 2)`;
        statusEl.className = "text-xs text-slate-400";
        return;
      }

      if (hrVal >= zone2Lower && hrVal <= zone2Upper) {
        statusEl.innerHTML = `✅ Zone 2 (${zone2Lower}-${zone2Upper} bpm)`;
        statusEl.className = "text-xs hr-zone-valid";
      } else if (hrVal >= zone2Lower - 5 && hrVal <= zone2Upper + 5) {
        statusEl.innerHTML = `⚠️ Near Zone 2 (Target: ${zone2Lower}-${zone2Upper})`;
        statusEl.className = "text-xs hr-zone-warning";
      } else {
        statusEl.innerHTML = `❌ Outside Zone 2 (Target: ${zone2Lower}-${zone2Upper})`;
        statusEl.className = "text-xs hr-zone-invalid";
      }
    },

    selectNote: (sessionId, exerciseIdx, note) => {
      LS_SAFE.set(`${sessionId}_ex${exerciseIdx}_cardio_note`, note);
      
      // V30.5: Update DOM directly without full re-render to prevent UI jump
      const card = document.getElementById(`card-${exerciseIdx}`);
      if (card) {
        const buttons = card.querySelectorAll('.quick-note-badge');
        buttons.forEach(btn => {
          if (btn.textContent.trim() === note) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        });
      }
    },

    toggleComplete: (sessionId, exerciseIdx, complete) => {
      if (complete) {
        const duration = LS_SAFE.get(
          `${sessionId}_ex${exerciseIdx}_duration`
        );
        const hr = LS_SAFE.get(`${sessionId}_ex${exerciseIdx}_hr`);

        if (!duration || !hr) {
          alert("Please fill Duration and Heart Rate before completing");
          return;
        }
      }

      LS_SAFE.set(
        `${sessionId}_ex${exerciseIdx}_completed`,
        complete.toString()
      );

      // V30.5: Full DOM update without re-render to prevent UI jump
      const card = document.getElementById(`card-${exerciseIdx}`);
      if (!card) return;

      const cardContent = card.querySelector('.p-4.space-y-3');

      if (complete) {
        // Get saved data for summary
        const duration = LS_SAFE.get(`${sessionId}_ex${exerciseIdx}_duration`);
        const hr = LS_SAFE.get(`${sessionId}_ex${exerciseIdx}_hr`);
        const machine = LS_SAFE.get(`${sessionId}_ex${exerciseIdx}_machine`) || 'Treadmill';
        
        // Get exercise info
        const session = window.APP.state.workoutData[sessionId];
        const exercise = session.exercises[exerciseIdx];
        const optIdx = LS_SAFE.get(`pref_${sessionId}_${exerciseIdx}`) || 0;
        const opt = exercise.options[optIdx] || exercise.options[0];
        const optName = opt.n || 'LISS Cardio';

        // Add completed classes
        card.classList.add("all-completed");
        card.classList.add("card-collapsed");

        // Replace content with summary
        if (cardContent) {
          cardContent.innerHTML = `
            <div class="cardio-complete-summary">
                <div class="flex items-center gap-3 mb-2">
                    <div class="text-4xl">🎯</div>
                    <div>
                        <div class="text-sm font-bold text-white mb-1 opacity-75"><span class="text-blue-400 mr-2">#${exerciseIdx + 1}</span> ${optName}</div>
                        <div class="text-2xl font-black text-blue-400">${duration} min</div>
                        <div class="text-sm text-slate-300">💓 ${hr} bpm • ${machine}</div>
                    </div>
                </div>
                <button onclick="APP.cardio.toggleComplete('${sessionId}', ${exerciseIdx}, false)" class="w-full bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold py-2 rounded-lg mt-2">
                    <i class="fa-solid fa-chevron-down mr-1"></i> Show Details
                </button>
            </div>
          `;
        }
      } else {
        // V30.5: Expanding - generate full form without re-render
        card.classList.remove("all-completed");
        card.classList.remove("card-collapsed");

        // Get saved data
        const duration = LS_SAFE.get(`${sessionId}_ex${exerciseIdx}_duration`) || '30';
        const hr = LS_SAFE.get(`${sessionId}_ex${exerciseIdx}_hr`) || '';
        const machine = LS_SAFE.get(`${sessionId}_ex${exerciseIdx}_machine`) || 'Treadmill';
        const note = LS_SAFE.get(`${sessionId}_ex${exerciseIdx}_cardio_note`) || '';
        
        // Get exercise info
        const session = window.APP.state.workoutData[sessionId];
        const exercise = session.exercises[exerciseIdx];
        const optIdx = LS_SAFE.get(`pref_${sessionId}_${exerciseIdx}`) || 0;
        const opt = exercise.options[optIdx] || exercise.options[0];
        
        // Get HR zone info
        const profile = LS_SAFE.getJSON("profile", {});
        const age = profile.a || 30;
        const maxHR = 220 - age;
        const zone2Lower = Math.round(maxHR * 0.6);
        const zone2Upper = Math.round(maxHR * 0.7);
        
        let hrStatus = `Target: ${zone2Lower}-${zone2Upper} bpm (Zone 2)`;
        let hrClass = "text-slate-400";
        if (hr) {
          const hrVal = parseInt(hr);
          if (hrVal >= zone2Lower && hrVal <= zone2Upper) {
            hrStatus = `✅ Zone 2 (${zone2Lower}-${zone2Upper} bpm)`;
            hrClass = "hr-zone-valid";
          } else if (hrVal >= zone2Lower - 5 && hrVal <= zone2Upper + 5) {
            hrStatus = `⚠️ Near Zone 2 (Target: ${zone2Lower}-${zone2Upper})`;
            hrClass = "hr-zone-warning";
          } else {
            hrStatus = `❌ Outside Zone 2 (Target: ${zone2Lower}-${zone2Upper})`;
            hrClass = "hr-zone-invalid";
          }
        }
        
        // Get machine options
        const machines = opt.machines || ["Treadmill", "Static Bike", "Rowing Machine", "Elliptical"];
        const machineOptions = machines
          .map(m => `<option value="${m}" ${m === machine ? "selected" : ""}>${m}</option>`)
          .join("");
        
        // Get quick notes
        const quickNotes = ["Felt easy", "Good pace", "Tough", "Perfect recovery"];
        const noteButtons = quickNotes
          .map(n => `<button onclick="APP.cardio.selectNote('${sessionId}', ${exerciseIdx}, '${n}')" class="quick-note-badge ${note === n ? "active" : ""}">${n}</button>`)
          .join("");

        // Replace content with full form
        if (cardContent) {
          cardContent.innerHTML = `
            <div>
                <label class="text-xs text-slate-400 block mb-1">Equipment</label>
                <select onchange="LS_SAFE.set('${sessionId}_ex${exerciseIdx}_machine', this.value)" class="w-full glass-input border border-white/10 text-white text-sm rounded p-2">
                    ${machineOptions}
                </select>
            </div>
            
            <div>
                <label class="text-xs text-slate-400 block mb-2">⏱️ Duration</label>
                <div class="grid grid-cols-4 gap-2 mb-2">
                    ${[15, 20, 30, 45].map(min => `
                        <button onclick="APP.cardio.setDuration('${sessionId}', ${exerciseIdx}, ${min})" class="duration-preset-btn ${duration == min ? "active" : ""}">${min}m</button>
                    `).join("")}
                </div>
                <input type="number" id="duration-${sessionId}-${exerciseIdx}" value="${duration}" onchange="APP.cardio.setDuration('${sessionId}', ${exerciseIdx}, this.value)" class="w-full glass-input border border-white/10 text-white text-center rounded p-2 text-sm" placeholder="Custom minutes" />
            </div>
            
            <div>
                <label class="text-xs text-slate-400 block mb-1">💓 Average Heart Rate</label>
                <input type="number" id="hr-${sessionId}-${exerciseIdx}" value="${hr}" oninput="APP.cardio.validateHR('${sessionId}', ${exerciseIdx}, this.value)" class="w-full glass-input border border-white/10 text-white text-center rounded p-2 text-sm mb-1" placeholder="bpm" />
                <div id="hr-status-${sessionId}-${exerciseIdx}" class="text-xs ${hrClass}">${hrStatus}</div>
            </div>
            
            <div>
                <label class="text-xs text-slate-400 block mb-2">📝 How did it feel?</label>
                <div class="flex flex-wrap gap-2">
                    ${noteButtons}
                </div>
            </div>
            
            <button onclick="APP.cardio.toggleComplete('${sessionId}', ${exerciseIdx}, true)" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition active:scale-95">
                <i class="fa-solid fa-check"></i> COMPLETE CARDIO
            </button>
          `;
        }
      }
    },
  };

  // ============================================
  // APP.showStorageStats - LocalStorage Stats
  // ============================================

  APP.showStorageStats = () => {
    const stats = LS_SAFE.getStats();

    // V30.0 Phase 3.5: Support both profile-modal and settings-view contexts
    const settingsView = document.getElementById("settings-view");
    const isSettingsView = settingsView && !settingsView.classList.contains('hidden');
    const prefix = isSettingsView ? "settings-" : "";

    const itemsEl = document.getElementById(`${prefix}stat-items`);
    const sizeEl = document.getElementById(`${prefix}stat-size`);
    const usageEl = document.getElementById(`${prefix}stat-usage`);
    const bar = document.getElementById(`${prefix}usage-bar`);

    if (itemsEl) itemsEl.innerText = stats.items;
    if (sizeEl) sizeEl.innerText = stats.sizeKB + " KB";
    if (usageEl) usageEl.innerText = stats.usage;

    const usagePercent = parseFloat(stats.usage);
    if (bar) {
      bar.style.width = usagePercent + "%";

      if (usagePercent > 80) {
        bar.className = "bg-red-500 h-full transition-all";
      } else if (usagePercent > 50) {
        bar.className = "bg-yellow-500 h-full transition-all";
      } else {
        bar.className = "bg-emerald-500 h-full transition-all";
      }
    }

    console.log("Storage Stats:", stats);
  };

  console.log("[CARDIO] ✅ Cardio, Timer & Storage Stats loaded");
})();
