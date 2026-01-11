(() => {
  function q(os, s){
    s = String(s ?? "");
    // 用单引号，避免空格问题；Windows PowerShell 也支持单引号
    if (os === "win") return "'" + s.replace(/'/g, "''") + "'";
    return "'" + s.replace(/'/g, "'\\''") + "'";
  }

  function header(cfg){
    const lp = cfg?.lerobot?.ports?.leaderPort || "<LEADER_PORT>";
    const fp = cfg?.lerobot?.ports?.followerPort || "<FOLLOWER_PORT>";
    return `# Replace ports if needed:\n#   LEADER_PORT=${lp}\n#   FOLLOWER_PORT=${fp}\n`;
  }

  function build(cfg){
    const os = cfg?.ui?.os || "win";
    const baud = Number(cfg?.lerobot?.baud || 1000000);
    const leaderId = (cfg?.lerobot?.leader?.calibId || "my_leader_arm").trim();
    const followerId = (cfg?.lerobot?.follower?.calibId || "my_follower_arm").trim();
    const leaderPort = (cfg?.lerobot?.ports?.leaderPort || "<LEADER_PORT>").trim();
    const followerPort = (cfg?.lerobot?.ports?.followerPort || "<FOLLOWER_PORT>").trim();

    const displayData = cfg?.lerobot?.commandFlags?.display_data ? "true" : "false";
    const camJson = (cfg?.lerobot?.commandFlags?.robot_cameras_json || "").trim();
    const camArg = camJson ? ` --robot.cameras=${q(os, camJson)}` : "";

    const teleop =
      "lerobot-teleoperate" +
      ` --robot.type=${q(os,"so101_follower")}` +
      ` --robot.port=${q(os,followerPort)}` +
      ` --robot.id=${q(os,followerId)}` +
      ` --teleop.type=${q(os,"so101_leader")}` +
      ` --teleop.port=${q(os,leaderPort)}` +
      ` --teleop.id=${q(os,leaderId)}` +
      camArg +
      ` --display_data=${displayData}`;

    const calibrateLeader =
      "lerobot-calibrate" +
      ` --robot.type=${q(os,"so101_leader")}` +
      ` --robot.port=${q(os,leaderPort)}` +
      ` --robot.id=${q(os,leaderId)}` +
      ` --robot.baud=${baud}`;

    const calibrateFollower =
      "lerobot-calibrate" +
      ` --robot.type=${q(os,"so101_follower")}` +
      ` --robot.port=${q(os,followerPort)}` +
      ` --robot.id=${q(os,followerId)}` +
      ` --robot.baud=${baud}`;

    const record =
      "lerobot-record" +
      ` --robot.type=${q(os,"so101_follower")}` +
      ` --robot.port=${q(os,followerPort)}` +
      ` --robot.id=${q(os,followerId)}` +
      ` --teleop.type=${q(os,"so101_leader")}` +
      ` --teleop.port=${q(os,leaderPort)}` +
      ` --teleop.id=${q(os,leaderId)}` +
      camArg +
      ` --display_data=${displayData}`;

    const replay =
      "lerobot-replay" +
      ` --robot.type=${q(os,"so101_follower")}` +
      ` --robot.port=${q(os,followerPort)}` +
      ` --robot.id=${q(os,followerId)}`;

    // Train (smolvla as default)
    const tr = cfg?.lerobot?.train || {};
    const dataset = (tr.dataset_repo_id || "<DATASET_REPO_ID>").trim();
    const outputDir = (tr.output_dir || "").trim();
    const policy = (tr.policy_path || "lerobot/smolvla_base").trim();
    const batch = Number(tr.batch_size || 64);
    const steps = Number(tr.steps || 20000);

    const train =
      "lerobot-train" +
      ` --policy.path=${q(os,policy)}` +
      ` --dataset.repo_id=${q(os,dataset)}` +
      (outputDir ? ` --output_dir=${q(os,outputDir)}` : "") +
      ` --batch_size=${batch}` +
      ` --steps=${steps}`;

    // smolVLA “quick reproduce” hints (from docs)
    // NOTE: docs may evolve; keep this as lightweight templates
    const smolvlaQuick = [
      "# smolVLA quick reproduce templates (edit as needed):",
      "lerobot-train --policy.path='lerobot/smolvla_base' --dataset.repo_id='<DATASET_REPO_ID>' --batch_size=64 --steps=20000",
      "lerobot-train --policy.path='lerobot/smolvla_small' --dataset.repo_id='<DATASET_REPO_ID>' --batch_size=64 --steps=20000",
      "lerobot-train --policy.path='lerobot/smolvla_tiny' --dataset.repo_id='<DATASET_REPO_ID>' --batch_size=64 --steps=20000",
    ].join("\n");

    return {
      os,
      header: header(cfg),
      calibrateLeader,
      calibrateFollower,
      teleop,
      record,
      replay,
      train,
      smolvlaQuick
    };
  }

  async function copy(text){
    try{
      await navigator.clipboard.writeText(text);
      return true;
    }catch{
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      return true;
    }
  }

  window.SuiteCmdGen = { build, copy };
})();