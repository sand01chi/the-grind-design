(function() {
  'use strict';

  // ============================================
  // Google Drive Cloud Backup/Restore
  // ============================================

  const CLIENT_ID =
    "803066941400-pelvk18jb4s7jsqajbic3ig6e4g2c37p.apps.googleusercontent.com";
  const SCOPES = "https://www.googleapis.com/auth/drive.appdata";
  let tokenClient;

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

  console.log("[CLOUD] ✅ Google Drive backup/restore loaded");
})();
