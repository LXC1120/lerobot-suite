(() => {
  function el(tag, attrs={}, children=[]){
    const n = document.createElement(tag);
    Object.entries(attrs).forEach(([k,v]) => {
      if (k === "class") n.className = v;
      else if (k === "html") n.innerHTML = v;
      else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v);
    });
    children.forEach(c => n.appendChild(c));
    return n;
  }

  function t(path, fallback){
    const dict = window.__i18nDict || {};
    const val = path.split(".").reduce((o,k)=> (o && o[k] != null ? o[k] : null), dict);
    return val == null ? fallback : String(val);
  }

  function currentPageKey(){
    const p = location.pathname.split("/").pop() || "";
    if (p.includes("servo")) return "servo";
    if (p.includes("calibrate")) return "calibrate";
    if (p.includes("train")) return "train";
    return "";
  }

  async function mountFAB(){
    // Ensure i18n is applied
    if (window.SuiteI18n?.apply) await window.SuiteI18n.apply();

    const cfg = window.SuiteConfig.get();

    // FAB button
    const fab = el("button", { class:"fab", id:"suiteFab", title:"Settings" }, [
      el("span", { html:"⚙️" })
    ]);
    const badge = el("div", { class:"fabBadge", id:"suiteFabBadge" });
    badge.textContent = (cfg.ui?.lang || "zh-CN") + " / " + (cfg.ui?.os || "win");
    fab.appendChild(badge);

    // Dialog
    const dlg = el("dialog", { id:"suiteFabDlg" });
    const modal = el("div", { class:"modal" });

    const header = el("div", { class:"modalHeader" }, [
      el("strong", { id:"suiteFabTitle" }),
      el("button", { class:"btn", id:"suiteFabClose" })
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
    ["win","mac","linux"].forEach(v => {
      const label = v === "win" ? "Windows" : (v === "mac" ? "macOS" : "Linux");
      selOS.appendChild(el("option", { value:v }, [document.createTextNode(label)]));
    });
    selOS.value = cfg.ui?.os || "win";
    osWrap.appendChild(selOS);

    grid.append(langWrap, osWrap);

    const row = el("div", { class:"row", style:"margin-top:12px" });
    const btnImport = el("button", { class:"btn", id:"suiteImport" });
    const btnExport = el("button", { class:"btn", id:"suiteExport" });
    const btnReset  = el("button", { class:"btn", id:"suiteReset" });
    btnImport.textContent = t("portal.import","导入配置文件");
    btnExport.textContent = t("portal.export","导出配置文件");
    btnReset.textContent  = t("portal.reset","恢复默认配置");
    row.append(btnImport, btnExport, btnReset);

    const tips = el("p", { class:"small muted", style:"margin-top:10px" });
    tips.textContent = t("portal.tips","提示：串口与目录权限需要每台电脑/浏览器手动授权一次。");

    modal.append(header, grid, row, tips);
    dlg.appendChild(modal);

    document.body.append(fab, dlg);

    // i18n text
    document.getElementById("suiteFabTitle").textContent = "Settings";
    document.getElementById("suiteFabClose").textContent = t("common.close","关闭");

    // Events
    fab.addEventListener("click", () => dlg.showModal());
    document.getElementById("suiteFabClose").addEventListener("click", () => dlg.close());

    selLang.addEventListener("change", async () => {
      window.SuiteConfig.set({ ui: { lang: selLang.value } });
      await window.SuiteI18n.apply();
      // refresh badge + optionally reload to re-render static labels
      badge.textContent = (window.SuiteConfig.get().ui.lang) + " / " + (window.SuiteConfig.get().ui.os);
      location.reload();
    });

    selOS.addEventListener("change", () => {
      window.SuiteConfig.set({ ui: { os: selOS.value } });
      badge.textContent = (window.SuiteConfig.get().ui.lang) + " / " + (window.SuiteConfig.get().ui.os);
      // 不强制刷新：命令页会监听 config 变化自行更新；这里保持一致简单 reload 也可以
      const page = currentPageKey();
      if (page === "calibrate" || page === "train") location.reload();
    });

    btnImport.addEventListener("click", async () => {
      try{
        await window.SuiteConfig.importFromFile();
        badge.textContent = (window.SuiteConfig.get().ui.lang) + " / " + (window.SuiteConfig.get().ui.os);
        alert("已导入配置");
        location.reload();
      }catch(e){ alert("导入失败: " + (e?.message||e)); }
    });

    btnExport.addEventListener("click", async () => {
      try{ await window.SuiteConfig.exportToFile(); }
      catch(e){ alert("导出失败: " + (e?.message||e)); }
    });

    btnReset.addEventListener("click", () => {
      if (!confirm("确定恢复默认配置？")) return;
      window.SuiteConfig.reset();
      location.reload();
    });
  }

  window.SuiteFAB = { mountFAB };
})();
