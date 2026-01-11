(() => {
  const KEY = "lerobot_suite_config_v1";

  function deepMerge(a, b){
    if (typeof a !== "object" || !a) return structuredClone(b);
    const out = structuredClone(a);
    for (const [k,v] of Object.entries(b || {})){
      if (v && typeof v === "object" && !Array.isArray(v)) out[k] = deepMerge(out[k] || {}, v);
      else out[k] = v;
    }
    return out;
  }

  const DEFAULT_CONFIG = {
    version: "suite_v1",
    ui: { lang: "zh-CN", os: "win" },
    shop: { url: "https://example.com", qr: "assets/qr.png" },

    servoTool: {
      baud: 1000000,
      scanRange: [1, 20],
      posPeriodMs: 50,
      pipelineRange: [1, 6],
      idNotes: {} // { "1": "肩关节", ... }
    },

    lerobot: {
      baud: 1000000,
      jointIds: [1,2,3,4,5,6],
      leader: { calibId: "", note: "主臂" },
      follower: { calibId: "", note: "从臂" },
      cameras: { mainDeviceLabelHint: "", auxDeviceLabelHint: "" },
      commandFlags: { display_data: true, robot_cameras_json: "" },
      calibNotes: {} // calibId -> note
    },

    hf: { enabled: false, username: "", repo: "" }
  };

  function load(){
    try{
      const raw = localStorage.getItem(KEY);
      if (!raw) return structuredClone(DEFAULT_CONFIG);
      const cfg = JSON.parse(raw);
      return deepMerge(DEFAULT_CONFIG, cfg);
    }catch{
      return structuredClone(DEFAULT_CONFIG);
    }
  }

  function save(cfg){
    localStorage.setItem(KEY, JSON.stringify(cfg));
    window.dispatchEvent(new CustomEvent("suite-config-changed", { detail: cfg }));
  }

  function get(){ return load(); }
  function set(partial){
    const cfg = deepMerge(load(), partial);
    save(cfg);
    return cfg;
  }

  function downloadText(filename, text){
    const blob = new Blob([text], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 2000);
  }

  async function exportToFile(){
    const cfg = load();
    const jsonText = JSON.stringify(cfg, null, 2);

    // File System Access API（Chrome/Edge 桌面）
    if (window.showSaveFilePicker){
      const handle = await window.showSaveFilePicker({
        suggestedName: "lerobot-suite-config.json",
        types: [{ description:"JSON", accept: {"application/json":[".json"]} }]
      });
      const writable = await handle.createWritable();
      await writable.write(jsonText);
      await writable.close();
      return;
    }
    // fallback
    downloadText("lerobot-suite-config.json", jsonText);
  }

  async function importFromFile(){
    if (window.showOpenFilePicker){
      const [handle] = await window.showOpenFilePicker({
        multiple: false,
        types: [{ description:"JSON", accept: {"application/json":[".json"]} }]
      });
      const file = await handle.getFile();
      const text = await file.text();
      const cfg = JSON.parse(text);
      save(deepMerge(DEFAULT_CONFIG, cfg));
      return;
    }
    // fallback input
    return new Promise((resolve, reject) => {
      const inp = document.createElement("input");
      inp.type = "file";
      inp.accept = ".json,application/json";
      inp.onchange = async () => {
        try{
          const file = inp.files?.[0];
          if (!file) return reject(new Error("未选择文件"));
          const text = await file.text();
          const cfg = JSON.parse(text);
          save(deepMerge(DEFAULT_CONFIG, cfg));
          resolve();
        }catch(e){ reject(e); }
      };
      inp.click();
    });
  }

  function reset(){ save(structuredClone(DEFAULT_CONFIG)); }

  window.SuiteConfig = { get, set, save, load, exportToFile, importFromFile, reset, DEFAULT_CONFIG };
})();
