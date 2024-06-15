const express = require("express");
const router = express.Router();
const piWifi = require("pi-wifi");

const cameraStream = require("./utils/camera-stream");
const command = require("./utils/command");
const Database = require("./database");
const ScheduleModel = require("./models/scheduled-record");
const ConfigModel = require("./models/device-settings");
const Scheduler = require("./tasks");
const Integrations = require("./integrations");
const config = require("../config/server.json");

const fs = require("fs");
const { promisify } = require("util");
const write = promisify(fs.writeFile);

const hostname = require("os").hostname();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.json({
    message: "Hello World",
  });
});

router.get("/live", async (req, res) => {
  res.writeHead(200, {
    "Content-Type": "video/mp4",
    Connection: "keep-alive",
  });

  const stream = cameraStream.getLiveStream(15);

  stream.pipe(res);

  res.on("close", () => cameraStream.endLiveStream());
});

router.get("/image", async (req, res) => {
  res.writeHead(200, {
    "Content-Type": "image/jpeg",
    Connection: "keep-alive",
  });

  return res.end(await cameraStream.getFrame());
});

router.get("/current-job", async (req, res) => {
  try {
    const current = Scheduler.getCurrentJob();
    const hasMotion = await Scheduler.getMotion();

    res.json({ current, hasMotion });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: true });
  }
});

router.get("/info", async (req, res) => {
  try {
    res.json({
      ...config,
      needsAuth: !Integrations.authed,
      hostname,
    });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: true });
  }
});

router.post("/config", async (req, res) => {
  try {
    const configData = req.body;

    await ConfigModel.validate(configData);

    await write("./config/server.json", JSON.stringify(configData));
    res.json(configData);
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: true, message: e.message });
  }
});

router.get("/schedules", async (req, res) => {
  try {
    const schedules = await Database.getSchedules();
    res.json(schedules);
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: true, message: e.message });
  }
});

router.get("/schedule/template", async (req, res) => {
  try {
    res.json(ScheduleModel.default());
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: true, message: e.message });
  }
});

router.delete("/schedule/:id", async (req, res) => {
  try {
    res.json(Database.deleteSchedule(req.params.id));
    Scheduler.refreshSchedules();
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: true, message: e.message });
  }
});

router.post("/schedules", async (req, res) => {
  const scheduleData = req.body;

  try {
    await ScheduleModel.validate(scheduleData);
    const schedule = await Database.putSchedule(scheduleData);
    Scheduler.refreshSchedules();
    res.json({ schedule });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: true, message: e.message });
  }
});

router.get("/wifi/scan", (req, res) => {
  piWifi.scan((err, networks) => {
    if (err) {
      console.error(err);
      return res.status(400).json(err);
    }
    res.json(networks);
  });
});

router.post("/wifi/connect", (req, res) => {
  const connection = req.body;

  piWifi.connectTo(connection, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(400).json(err);
    }
    res.json(result);
  });
});

router.post("/hostname/update", (req, res) => {
  const host = req.body.hostname;

  console.log("changing host to", host);

  const cmd = command("sudo", "raspi-config nonint do_hostname " + host);

  cmd.on("exit", () => {
    res.json({ success: true });
    command("sudo", "reboot");
  });

  cmd.on("error", () => {
    return res.status(400).json({ error: true });
  });
});

router.get("/integration/auth-url", (req, res) => {
  return res.redirect(Integrations.beginLogin());
});

router.post("/integration/auth-token", async (req, res) => {
  const token = req.body.token;

  await Integrations.completeLogin(token);

  if (Integrations.authed) {
    return res.json({ authed: Integrations.authed });
  } else {
    return res.status(400).json({ message: "Failed to auth" });
  }
});

module.exports = router;
