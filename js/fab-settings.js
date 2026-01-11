(() => {
  function t(path, fallback){
    const dict = window.__i18nDict || {};
    const val = path.split(".").reduce((o,k)=> (o && o[k] != null ? o[k] : null), dict);
    return val == null ? fallback : String(val);
  }

  function el(tag, attrs={}, children=[]){
    const n = document.createElement(tag);
    for (const [k,v] of Object.entries(attrs)){
      if (k === "class") n.className = v;
      else if (k === "html") n.innerHTML = v;
      else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v);
    }
    for (const c of children) n.appendChild(c);
    return n;
  }

  async function mountFAB(){
    await window.SuiteI18n.apply();

    const cfg = window.SuiteConfig.get();

    const fab = el("button", { class:"fab", id:"suiteFab", title:"Settings" }, [
      el("span", { html:"⚙️" })
    ]);

    const badge = el("div", { class:"fabBadge", id:"suiteFabBadge" });
    badge.textContent = (cfg.ui?.lang || "zh-CN") + " / " + (cfg.ui?.os || "win");
    fab.appendChild(badge);

    const dlg = el("dialog", { id:"suiteFabDlg" });
    const modal = el("div", { class:"modal" });

    const header = el("div", { class:"modalHeader" }, [
      el("strong", { id:"suiteFabTitle", html:"Settings" }),
      el("button", { class:"btn", id:"suiteFabClose", html:t("common.close","关闭") })
    ]);

    const grid = el("div", { class:"grid2" });

    const langWrap = el("label", { class:"small" });
    langWrap.appendChild(document.createTextNode(t("portal.lang","页面语言")));
    const selLang = el("select", { id:"suiteLang", style:"width:100%" });
    selLang.appendChild(el("option", { value:"zh-CN" }, [document.createTextNode("中文")]));
    selLang.appendChild(el("option", { value:"en" }, [document.createTextNode("English")]));
    selLang.value = cfg.ui?.lang || "zh-CN";
    langWrap.appendChild(selLang);

    const osWrap = el("label", { class:"small" });
    osWrap.appendChild(document.createTextNode(t("portal.os","运行系统")));
    const selOS = el("select", { id:"suiteOS", style:"width:100%" });
    [["win","Windows"],["mac","macOS"],["linux","Linux"]].forEach(([v,label])=>{
      selOS.appendChild(el("option", { value:v }, [document.createTextNode(label)]));
    });
    selOS.value = cfg.ui?.os || "win";
    osWrap.appendChild(selOS);

    grid.append(langWrap, osWrap);

    const row = el("div", { class:"row", style:"margin-top:12px" });
    const btnImport = el("button", { class:"btn", id:"suiteImport", html:t("portal.import","导入配置文件") });
    const btnExport = el("button", { class:"btn", id:"suiteExport", html:t("portal.export","导出配置文件") });
    const btnReset  = el("button", { class:"btn", id:"suiteReset",  html:t("portal.reset","恢复默认配置") });
    row.append(btnImport, btnExport, btnReset);

    const tips = el("p", { class:"small muted", style:"margin-top:10px" });
    tips.textContent = t("portal.tips","提示：串口与目录权限出于浏览器安全限制，需要在每台电脑/每个浏览器手动授权一次。");

    modal.append(header, grid, row, tips);
    dlg.appendChild(modal);

    document.body.append(fab, dlg);

    fab.addEventListener("click", () => dlg.showModal());
    document.getElementById("suiteFabClose").addEventListener("click", () => dlg.close());

    selLang.addEventListener("change", async () => {
      window.SuiteConfig.set({ ui: { lang: selLang.value } });
      location.reload();
    });

    selOS.addEventListener("change", () => {
      window.SuiteConfig.set({ ui: { os: selOS.value } });
      location.reload();
    });

    btnImport.addEventListener("click", async () => {
      try{
        await window.SuiteConfig.importFromFile();
        alert("已导入配置");
        location.reload();
      }catch(e){
        alert("导入失败: " + (e?.message||e));
      }
    });

    btnExport.addEventListener("click", async () => {
      try{
        await window.SuiteConfig.exportToFile();
      }catch(e){
        alert("导出失败: " + (e?.message||e));
      }
    });

    btnReset.addEventListener("click", () => {
      if (!confirm("确定恢复默认配置？")) return;
      window.SuiteConfig.reset();
      location.reload();
    });
  }

  window.SuiteFAB = { mountFAB };
})();
