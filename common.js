
const APP_KEY = "lerobot_suite_config_v1";
const DEFAULT_CONFIG = {
  lang: "zh",
  os: "linux", // linux | mac | win
  devices: {
    leaderPortPath: "",
    followerPortPath: "",
    camMainLabel: "",
    camAuxLabel: ""
  },
  paths: {
    calibDirNote: "",
    dataDirNote: "",
    outputsDirNote: ""
  },
  hf: {
    username: "",
    token: "" // optional; storing token in browser/local config is your choice
  },
  training: {
    datasetRepoId: "",
    policy: "act", // act | diffusion | vqbet | smolvla | custom
    outputDir: "outputs/train/run1",
    jobName: "run1",
    device: "cuda", // cuda | mps | cpu
    wandb: true,
    batchSize: 64,
    steps: 20000,
    smolvlaBase: "lerobot/smolvla_base",
    taskText: ""
  },
  cloud: {
    provider: "",
    endpoint: "",
    sshUser: "",
    sshHost: "",
    sshPort: 22,
    notes: ""
  },
  notes: {
    hardware: "",
    calib: "",
    dataset: ""
  }
};

export function loadConfig() {
  try {
    const raw = localStorage.getItem(APP_KEY);
    if (!raw) return structuredClone(DEFAULT_CONFIG);
    const cfg = JSON.parse(raw);
    return mergeDeep(structuredClone(DEFAULT_CONFIG), cfg);
  } catch {
    return structuredClone(DEFAULT_CONFIG);
  }
}
export function saveConfig(cfg) {
  localStorage.setItem(APP_KEY, JSON.stringify(cfg, null, 2));
}
export function resetConfig() {
  localStorage.removeItem(APP_KEY);
}
export function downloadText(filename, text) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a);
  a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 1500);
}
export async function readFileAsText(file) {
  return await file.text();
}
export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
}
export function mergeDeep(target, source) {
  if (typeof source !== "object" || source === null) return target;
  for (const k of Object.keys(source)) {
    const sv = source[k];
    if (Array.isArray(sv)) target[k] = sv.slice();
    else if (typeof sv === "object" && sv !== null) {
      if (typeof target[k] !== "object" || target[k] === null) target[k] = {};
      mergeDeep(target[k], sv);
    } else target[k] = sv;
  }
  return target;
}
export function esc(s){ return (s==null) ? "" : String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
export function fmtOSQuote(os, s) {
  s = String(s ?? "");
  if (os === "win") return "'" + s.replace(/'/g, "''") + "'";
  return "'" + s.replace(/'/g, "'\\''") + "'";
}
export function t(cfg, zh, en){ return (cfg.lang === "en") ? en : zh; }
