(() => {
  const KEY = "lerobot_suite_config_v2";

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
    version: "suite_v2",
    ui: { lang: "zh-CN", os: "win" },

    // 用于你的推广：二维码与链接
    shop: { url: "https://example.com", qr: "assets/qr.png" },

    // 舵机工具（V8.2）建议参数（注意：真正生效仍以 servo-tool 页面自身 localStorage 为准）
    servoTool: {
      baud: 1000000,
      scanRange: [1, 20],
      posPeriodMs: 50,
      pipelineRange: [1, 6],
      idNotes: {} // {"1":"肩", ...} 预留
    },

    // LeRobot 命令生成用到的“永久配置”
    lerobot: {
      baud: 1000000,
      jointIds: [1,2,3,4,5,6],

      leader: { calibId: "", note: "leader" },
      follower: { calibId: "", note: "follower" },

      // 这里保存“端口路径/备注”，因为浏览器无法自动读取系统的 /dev/tty* / COM*
      ports: {
        leaderPort: "",   // 例: COM5 或 /dev/ttyUSB0 或 /dev/tty.usbmodem*
        followerPort: ""
      },

      cameras: {
        main: "",  // 例: 0 或 /dev/video0 或其它（按你的习惯填写备注）
        aux:  ""
      },

      paths: {
        calibDirNote: "", // 备注：例如 ~/.cache/huggingface/lerobot/calibration
        dataDirNote:  ""  // 备注：例如 ~/.cache/huggingface/lerobot/datasets
      },

      // 额外 flags
      commandFlags: {
        display_data: true,
        robot_cameras_json: ""
      },

      // train 用到的默认项（可在设置里长期保存）
      train: {
        dataset_repo_id: "",  // 例: username/my_dataset
        output_dir: "",       // 例: outputs/run1（可留空）
        policy_path: "lerobot/smolvla_base",
        batch_size: 64,
        steps: 20000
      }
    },

    // Hugging Face
    hf: {
      enabled: false,
      username: "",
      token: "" // ⚠️ 不要把包含 token 的配置文件公开分享
    },

    // 云 GPU / 训练服务器（预留）
    cloud: {
      provider: "",
      endpoint: "",
      ssh_host: "",
      ssh_user: "",
      notes: ""
    }
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