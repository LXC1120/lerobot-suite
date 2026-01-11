(() => {
  function quote(os, s){
    s = String(s ?? "");
    if (!s) return "''";
    if (os === "win") return "'" + s.replace(/'/g, "''") + "'";
    return "'" + s.replace(/'/g, "'\\''") + "'";
  }

  function buildCommands(cfg){
    const os = cfg.ui?.os || "win";
    const baud = Number(cfg.lerobot?.baud || 1000000);
    const leaderId = (cfg.lerobot?.leader?.calibId || "my_leader_arm").trim();
    const followerId = (cfg.lerobot?.follower?.calibId || "my_follower_arm").trim();
    const displayData = cfg.lerobot?.commandFlags?.display_data ? "true" : "false";
    const camJson = (cfg.lerobot?.commandFlags?.robot_cameras_json || "").trim();

    const leaderPort = "<LEADER_PORT>";
    const followerPort = "<FOLLOWER_PORT>";
    const camArg = camJson ? ` --robot.cameras=${quote(os, camJson)}` : "";

    const header = "# 请把 <LEADER_PORT> / <FOLLOWER_PORT> 替换为系统端口（如 COM3 / /dev/ttyUSB0 / /dev/tty.usbmodem*）\n";

    const teleop = [
      "lerobot-teleoperate",
      ` --robot.type=${quote(os,"so101_follower")}`,
      ` --robot.port=${quote(os,followerPort)}`,
      ` --robot.id=${quote(os,followerId)}`,
      ` --teleop.type=${quote(os,"so101_leader")}`,
      ` --teleop.port=${quote(os,leaderPort)}`,
      ` --teleop.id=${quote(os,leaderId)}`,
      camArg,
      ` --display_data=${displayData}`
    ].filter(Boolean).join("");

    const calLeader = [
      "lerobot-calibrate",
      ` --robot.type=${quote(os,"so101_leader")}`,
      ` --robot.port=${quote(os,leaderPort)}`,
      ` --robot.id=${quote(os,leaderId)}`,
      ` --robot.baud=${baud}`
    ].join("");

    const calFollower = [
      "lerobot-calibrate",
      ` --robot.type=${quote(os,"so101_follower")}`,
      ` --robot.port=${quote(os,followerPort)}`,
      ` --robot.id=${quote(os,followerId)}`,
      ` --robot.baud=${baud}`
    ].join("");

    const record = [
      "lerobot-record",
      ` --robot.type=${quote(os,"so101_follower")}`,
      ` --robot.port=${quote(os,followerPort)}`,
      ` --robot.id=${quote(os,followerId)}`,
      ` --teleop.type=${quote(os,"so101_leader")}`,
      ` --teleop.port=${quote(os,leaderPort)}`,
      ` --teleop.id=${quote(os,leaderId)}`,
      camArg,
      ` --display_data=${displayData}`
    ].filter(Boolean).join("");

    return { teleop: header + teleop, calLeader: header + calLeader, calFollower: header + calFollower, record: header + record };
  }

  async function copy(text){
    try{
      await navigator.clipboard.writeText(text);
      return true;
    }catch{
      const ta = document.createElement("textarea");
      ta.value = text; document.body.appendChild(ta);
      ta.select(); document.execCommand("copy"); ta.remove();
      return true;
    }
  }

  window.SuiteCmdGen = { buildCommands, copy };
})();
