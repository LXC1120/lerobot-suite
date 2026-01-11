(() => {
  async function loadDict(lang){
    try{
      const res = await fetch(`i18n/${lang}.json`, {cache:"no-store"});
      if (!res.ok) throw new Error("load failed");
      return await res.json();
    }catch{
      const res = await fetch(`i18n/zh-CN.json`, {cache:"no-store"});
      return await res.json();
    }
  }

  function applyDict(dict){
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      const val = key.split(".").reduce((o,k)=> (o && o[k] != null ? o[k] : null), dict);
      if (val == null) return;
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") el.placeholder = String(val);
      else el.textContent = String(val);
    });
  }

  async function apply(){
    const cfg = window.SuiteConfig?.get?.() || { ui:{lang:"zh-CN"} };
    const lang = cfg.ui?.lang || "zh-CN";
    const dict = await loadDict(lang);
    applyDict(dict);
    window.__i18nDict = dict;
  }

  window.SuiteI18n = { apply };
})();
