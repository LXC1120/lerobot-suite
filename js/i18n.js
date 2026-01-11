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

  async function apply(){
    const cfg = window.SuiteConfig?.get?.() || { ui:{lang:"zh-CN"} };
    const lang = cfg.ui?.lang || "zh-CN";
    const dict = await loadDict(lang);
    window.__i18nDict = dict;
  }

  window.SuiteI18n = { apply };
})();
