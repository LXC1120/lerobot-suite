(() => {
  function el(tag, attrs={}, children=[]){
    const e = document.createElement(tag);
    for (const [k,v] of Object.entries(attrs)){
      if (k === "class") e.className = v;
      else if (k === "html") e.innerHTML = v;
      else if (k.startsWith("on") && typeof v === "function") e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v);
    }
    for (const c of children) e.append(c);
    return e;
  }

  function inputRow(label, inputEl){
    const wrap = el("label", {class:"small", style:"display:block"});
    wrap.append(el("div", {class:"muted", style:"margin-bottom:4px"}, [document.createTextNode(label)]));
    wrap.append(inputEl);
    inputEl.style.width = "100%";
    return wrap;
  }

  function bindInput(input, getter, setter){
    input.value = getter() ?? "";
    input.addEventListener("change", () => setter(input.type === "checkbox" ? input.checked : input.value));
  }

  function mountFAB(){
    // FAB
    const fab = el("button", {class:"fab", title:"Settings"});
    fab.append(el("span",{class:"fabIcon"},[document.createTextNode("⚙")]));
    document.body.append(fab);

    const dlg = el("dialog");
    const modal = el("div",{class:"modal"});

    const hdr = el("div",{class:"modalHeader"});
    const ttl = el("strong",{"data-i18n":"fab.title"},[]);
    const btnClose = el("button",{class:"btn","data-i18n":"fab.close"});
    btnClose.addEventListener("click",()=>dlg.close());
    hdr.append(ttl, btnClose);

    const cfg = () => SuiteConfig.get();

    // UI section
    const uiSection = el("div",{class:"section"});
    uiSection.append(el("div",{class:"sectionTitle"},[document.createTextNode("UI")]));

    const selLang = el("select");
    selLang.append(el("option",{value:"zh-CN"},[document.createTextNode("中文")]));
    selLang.append(el("option",{value:"en"},[document.createTextNode("English")]));
    selLang.value = cfg().ui.lang || "zh-CN";

    const selOS = el("select");
    [["win","Windows"],["mac","macOS"],["linux","Linux"]].forEach(([v,tx])=>{
      selOS.append(el("option",{value:v},[document.createTextNode(tx)]));
    });
    selOS.value = cfg().ui.os || "win";

    uiSection.append(el("div",{class:"grid2"},[
      inputRow("", selLang),
      inputRow("", selOS),
    ]));
    uiSection.querySelectorAll("label")[0].querySelector("div").setAttribute("data-i18n","fab.lang");
    uiSection.querySelectorAll("label")[1].querySelector("div").setAttribute("data-i18n","fab.os");

    selLang.addEventListener("change", () => {
      SuiteConfig.set({ ui: { lang: selLang.value }});
      // i18n apply
      SuiteI18n.applyStatic();
      // refresh some dynamic texts if needed
      window.dispatchEvent(new Event("suite-ui-changed"));
    });
    selOS.addEventListener("change", () => {
      SuiteConfig.set({ ui: { os: selOS.value }});
      window.dispatchEvent(new Event("suite-ui-changed"));
    });

    // Permanent config section
    const perm = el("div",{class:"section"});
    perm.append(el("div",{class:"sectionTitle","data-i18n":"fab.permanent"}));

    const inpBaud = el("input",{inputmode:"numeric"});
    const inpLeaderPort = el("input",{placeholder:"COM5 / /dev/ttyUSB0"});
    const inpFollowerPort = el("input",{placeholder:"COM6 / /dev/ttyUSB1"});
    const inpLeaderId = el("input",{placeholder:"my_leader_arm"});
    const inpFollowerId = el("input",{placeholder:"my_follower_arm"});
    const inpMainCam = el("input",{placeholder:"0 / camera note"});
    const inpAuxCam  = el("input",{placeholder:"1 / camera note"});
    const inpCalibDir = el("input",{placeholder:"e.g. ~/.cache/huggingface/lerobot/calibration"});
    const inpDataDir  = el("input",{placeholder:"e.g. ~/.cache/huggingface/lerobot/datasets"});
    const inpCamJson = el("input",{placeholder:'{"front":{"type":"opencv","index_or_path":0}}'});
    const selDisplay = el("select");
    selDisplay.append(el("option",{value:"true"},[document.createTextNode("true")]));
    selDisplay.append(el("option",{value:"false"},[document.createTextNode("false")]));

    const syncFromCfg = () => {
      const c = cfg();
      inpBaud.value = String(c.lerobot.baud ?? 1000000);
      inpLeaderPort.value = c.lerobot.ports.leaderPort ?? "";
      inpFollowerPort.value = c.lerobot.ports.followerPort ?? "";
      inpLeaderId.value = c.lerobot.leader.calibId ?? "";
      inpFollowerId.value = c.lerobot.follower.calibId ?? "";
      inpMainCam.value = c.lerobot.cameras.main ?? "";
      inpAuxCam.value = c.lerobot.cameras.aux ?? "";
      inpCalibDir.value = c.lerobot.paths.calibDirNote ?? "";
      inpDataDir.value = c.lerobot.paths.dataDirNote ?? "";
      inpCamJson.value = c.lerobot.commandFlags.robot_cameras_json ?? "";
      selDisplay.value = c.lerobot.commandFlags.display_data ? "true" : "false";
    };

    const commit = () => {
      SuiteConfig.set({
        lerobot: {
          baud: Number(inpBaud.value || 1000000),
          ports: { leaderPort: inpLeaderPort.value.trim(), followerPort: inpFollowerPort.value.trim() },
          leader: { calibId: inpLeaderId.value.trim() },
          follower: { calibId: inpFollowerId.value.trim() },
          cameras: { main: inpMainCam.value.trim(), aux: inpAuxCam.value.trim() },
          paths: { calibDirNote: inpCalibDir.value.trim(), dataDirNote: inpDataDir.value.trim() },
          commandFlags: {
            robot_cameras_json: inpCamJson.value.trim(),
            display_data: selDisplay.value === "true"
          }
        }
      });
    };

    [inpBaud, inpLeaderPort, inpFollowerPort, inpLeaderId, inpFollowerId, inpMainCam, inpAuxCam, inpCalibDir, inpDataDir, inpCamJson, selDisplay]
      .forEach(x => x.addEventListener("change", commit));

    perm.append(el("div",{class:"grid2"},[
      inputRow(SuiteI18n.t("settings.baud"), inpBaud),
      inputRow(SuiteI18n.t("settings.display"), selDisplay),
    ]));
    perm.append(el("div",{class:"grid2",style:"margin-top:10px"},[
      inputRow(SuiteI18n.t("settings.leaderPort"), inpLeaderPort),
      inputRow(SuiteI18n.t("settings.followerPort"), inpFollowerPort),
    ]));
    perm.append(el("div",{class:"grid2",style:"margin-top:10px"},[
      inputRow(SuiteI18n.t("settings.calibIdLeader"), inpLeaderId),
      inputRow(SuiteI18n.t("settings.calibIdFollower"), inpFollowerId),
    ]));
    perm.append(el("div",{class:"grid2",style:"margin-top:10px"},[
      inputRow(SuiteI18n.t("settings.mainCam"), inpMainCam),
      inputRow(SuiteI18n.t("settings.auxCam"), inpAuxCam),
    ]));
    perm.append(el("div",{class:"grid2",style:"margin-top:10px"},[
      inputRow(SuiteI18n.t("settings.calibDir"), inpCalibDir),
      inputRow(SuiteI18n.t("settings.dataDir"), inpDataDir),
    ]));
    perm.append(el("div",{style:"margin-top:10px"},[
      inputRow(SuiteI18n.t("settings.camJson"), inpCamJson),
    ]));

    // HF section
    const hfSec = el("div",{class:"section"});
    hfSec.append(el("div",{class:"sectionTitle","data-i18n":"settings.hf"}));

    const chkHf = el("input",{type:"checkbox"});
    const inpHfUser = el("input",{placeholder:"username"});
    const inpHfToken = el("input",{placeholder:"hf_...", type:"password"});

    const commitHf = () => {
      SuiteConfig.set({ hf: { enabled: !!chkHf.checked, username: inpHfUser.value.trim(), token: inpHfToken.value.trim() }});
    };
    [chkHf, inpHfUser, inpHfToken].forEach(x=>x.addEventListener("change",commitHf));

    hfSec.append(el("div",{class:"grid2"},[
      inputRow(SuiteI18n.t("settings.hfEnable"), chkHf),
      inputRow(SuiteI18n.t("settings.hfUser"), inpHfUser),
    ]));
    hfSec.append(el("div",{style:"margin-top:10px"},[
      inputRow(SuiteI18n.t("settings.hfToken"), inpHfToken),
      el("div",{class:"small warn",style:"margin-top:8px","data-i18n":"fab.security"})
    ]));

    // Cloud section
    const cloudSec = el("div",{class:"section"});
    cloudSec.append(el("div",{class:"sectionTitle","data-i18n":"settings.cloud"}));

    const inpProv = el("input",{placeholder:"RunPod / Vast.ai / etc"});
    const inpEndp = el("input",{placeholder:"https://..."});
    const inpSSHHost = el("input",{placeholder:"xxx.xxx.xxx.xxx"});
    const inpSSHUser = el("input",{placeholder:"root"});
    const inpNotes = el("input",{placeholder:"notes"});
    const commitCloud = () => {
      SuiteConfig.set({ cloud: {
        provider: inpProv.value.trim(),
        endpoint: inpEndp.value.trim(),
        ssh_host: inpSSHHost.value.trim(),
        ssh_user: inpSSHUser.value.trim(),
        notes: inpNotes.value.trim()
      }});
    };
    [inpProv, inpEndp, inpSSHHost, inpSSHUser, inpNotes].forEach(x=>x.addEventListener("change",commitCloud));

    cloudSec.append(el("div",{class:"grid2"},[
      inputRow(SuiteI18n.t("settings.cloudProvider"), inpProv),
      inputRow(SuiteI18n.t("settings.cloudEndpoint"), inpEndp),
    ]));
    cloudSec.append(el("div",{class:"grid2",style:"margin-top:10px"},[
      inputRow(SuiteI18n.t("settings.cloudSSHHost"), inpSSHHost),
      inputRow(SuiteI18n.t("settings.cloudSSHUser"), inpSSHUser),
    ]));
    cloudSec.append(el("div",{style:"margin-top:10px"},[
      inputRow(SuiteI18n.t("settings.cloudNotes"), inpNotes),
    ]));

    // Import/export
    const tools = el("div",{class:"section"});
    tools.append(el("div",{class:"sectionTitle"},[document.createTextNode("Config")]));
    const btnImport = el("button",{class:"btn","data-i18n":"fab.import"});
    const btnExport = el("button",{class:"btn","data-i18n":"fab.export"});
    const btnReset  = el("button",{class:"btn","data-i18n":"fab.reset"});
    btnImport.addEventListener("click", async () => {
      try{ await SuiteConfig.importFromFile(); syncFromCfg(); syncHf(); syncCloud(); SuiteI18n.applyStatic(); window.dispatchEvent(new Event("suite-ui-changed")); }
      catch(e){ alert(e?.message || e); }
    });
    btnExport.addEventListener("click", async () => {
      try{ await SuiteConfig.exportToFile(); } catch(e){ alert(e?.message || e); }
    });
    btnReset.addEventListener("click", () => {
      if (!confirm("Reset to defaults?")) return;
      SuiteConfig.reset();
      syncFromCfg(); syncHf(); syncCloud(); SuiteI18n.applyStatic(); window.dispatchEvent(new Event("suite-ui-changed"));
    });
    tools.append(el("div",{class:"row"},[btnImport, btnExport, btnReset]));

    function syncHf(){
      const c = cfg();
      chkHf.checked = !!c.hf.enabled;
      inpHfUser.value = c.hf.username || "";
      inpHfToken.value = c.hf.token || "";
    }
    function syncCloud(){
      const c = cfg();
      inpProv.value = c.cloud.provider || "";
      inpEndp.value = c.cloud.endpoint || "";
      inpSSHHost.value = c.cloud.ssh_host || "";
      inpSSHUser.value = c.cloud.ssh_user || "";
      inpNotes.value = c.cloud.notes || "";
    }

    syncFromCfg(); syncHf(); syncCloud();

    modal.append(hdr, uiSection, el("hr",{class:"hr"}), perm, el("hr",{class:"hr"}), hfSec, el("hr",{class:"hr"}), cloudSec, el("hr",{class:"hr"}), tools);
    dlg.append(modal);
    document.body.append(dlg);

    fab.addEventListener("click", () => dlg.showModal());

    return { dlg, fab };
  }

  window.SuiteFAB = { mountFAB };
})();