(() => {
  const DICTS = {
    "zh-CN": {
      nav: { servo:"舵机配置", cmd:"LeRobot 命令生成", train:"训练/推理" },
      fab: { title:"设置", close:"关闭", lang:"语言", os:"系统", import:"导入配置", export:"导出配置", reset:"恢复默认",
             permanent:"永久配置", security:"注意：包含 HF Token 的配置不要公开分享。" },
      settings: {
        ports:"硬件/路径",
        leaderPort:"主臂串口路径",
        followerPort:"从臂串口路径",
        mainCam:"主摄像头备注",
        auxCam:"副摄像头备注",
        calibIdLeader:"主臂校准 ID",
        calibIdFollower:"从臂校准 ID",
        calibDir:"校准目录备注",
        dataDir:"数据目录备注",
        baud:"波特率",
        camJson:"robot.cameras JSON",
        display:"display_data",
        hf:"Hugging Face",
        hfEnable:"启用",
        hfUser:"用户名",
        hfToken:"Access Token",
        cloud:"云训练",
        cloudProvider:"服务商",
        cloudEndpoint:"Endpoint",
        cloudSSHHost:"SSH Host",
        cloudSSHUser:"SSH User",
        cloudNotes:"备注"
      },
      cmd: {
        title:"LeRobot 命令生成",
        subtitle:"本页只根据“设置”里的配置生成命令；点击即可复制。",
        hint:"提示：浏览器无法自动读取系统串口名称与本地目录路径，请在设置里填好（如 COM5 或 /dev/ttyUSB0）。",
        calibrateLeader:"校准主臂",
        calibrateFollower:"校准从臂",
        teleop:"遥操作（teleoperate）",
        record:"录制（record）",
        replay:"回放（replay）",
        train:"训练（train）",
        quick:"smolVLA 快速复现模板"
      }
    },
    "en": {
      nav: { servo:"Servo Config", cmd:"LeRobot Command Generator", train:"Train/Infer" },
      fab: { title:"Settings", close:"Close", lang:"Language", os:"OS", import:"Import config", export:"Export config", reset:"Reset",
             permanent:"Persistent config", security:"Warning: do not share configs containing HF tokens." },
      settings: {
        ports:"Hardware/Paths",
        leaderPort:"Leader port path",
        followerPort:"Follower port path",
        mainCam:"Main camera note",
        auxCam:"Aux camera note",
        calibIdLeader:"Leader calib ID",
        calibIdFollower:"Follower calib ID",
        calibDir:"Calibration dir note",
        dataDir:"Data dir note",
        baud:"Baudrate",
        camJson:"robot.cameras JSON",
        display:"display_data",
        hf:"Hugging Face",
        hfEnable:"Enable",
        hfUser:"Username",
        hfToken:"Access Token",
        cloud:"Cloud training",
        cloudProvider:"Provider",
        cloudEndpoint:"Endpoint",
        cloudSSHHost:"SSH Host",
        cloudSSHUser:"SSH User",
        cloudNotes:"Notes"
      },
      cmd: {
        title:"LeRobot Command Generator",
        subtitle:"Commands are generated from Settings. Click to copy.",
        hint:"Note: browsers cannot auto-detect system port names or local paths; fill them in Settings (e.g., COM5 or /dev/ttyUSB0).",
        calibrateLeader:"Calibrate leader",
        calibrateFollower:"Calibrate follower",
        teleop:"Teleoperate",
        record:"Record",
        replay:"Replay",
        train:"Train",
        quick:"smolVLA quick templates"
      }
    }
  };

  function getLang(){
    const cfg = window.SuiteConfig?.get?.();
    return cfg?.ui?.lang || "zh-CN";
  }

  function t(path, fallback=""){
    const lang = getLang();
    const dict = DICTS[lang] || DICTS["zh-CN"];
    const val = path.split(".").reduce((o,k)=> (o && o[k] != null ? o[k] : null), dict);
    return val == null ? fallback : String(val);
  }

  function applyStatic(){
    document.documentElement.lang = getLang();
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      el.textContent = t(key, el.textContent);
    });
  }

  window.SuiteI18n = { t, applyStatic };
})();