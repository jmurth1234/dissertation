const Agenda = require("agenda");
const camera = require("./camera");
const upload = require("./upload");
const Database = require("../database");

class Scheduler {
  constructor() {
    this.hasMotion = false;
    this.job = {}
    Database.on("connected", () => {
      this.agenda = new Agenda({ mongo: Database.connection.db("data") });

      this.agenda.define("cameraTask", { concurrency: 1 }, camera(Database, this));
      this.agenda.define("uploadTask", { concurrency: 1 }, upload(Database, this));

      this.agenda.start();

      this.agenda.every('1 minute', 'uploadTask')

      this.refreshSchedules();

      this.agenda.on("start:cameraTask", (job) => {
        this.job = job;
      });

      this.agenda.on("complete:cameraTask", (job) => {
        this.job = {};
      });
    });
  }

  async refreshSchedules() {
    this.agenda.cancel({ name: "cameraTask" });

    const schedules = await Database.getSchedules();

    Promise.all(schedules.map((s) => this.setupSchedule(s)));
  }

  /**
   * Get the current job
   *
   * @returns {Agenda.Job} a scheduled job
   */
  getCurrentJob() {
    if (!this.job.attrs) {
      return {}
    }

    return this.job.attrs.data;
  }

  /**
   * Gets whether the current frame has motion
   */
  async getMotion() {
    return this.hasMotion;
  }

  /**
   * Sets whether the current frame has motion
   */
  async setMotion(motion) {
    return this.hasMotion = motion;
  }

  /**
   * Setup a single scheduled record
   *
   * @param schedule a scheduled record
   */
  async setupSchedule(schedule) {
    const { startHour, startMinute, endHour, endMinute, runEvery } = schedule;

    const days = schedule.daysRunning.join(",");
    const cronEntries = [
      `${startMinute}-59/${runEvery} ${startHour} * * ${days}`,
      `0-${endMinute}/${runEvery} ${endHour} * * ${days}`,
    ];

    if (endHour - startHour > 1) {
      cronEntries.push(
        `0-59/${runEvery} ${startHour + 1}-${endHour - 1} * * ${days}`
      );
    }

    await Promise.all(
      cronEntries.map(async (cron, i) => {
        const job = this.agenda.create("cameraTask", { ...schedule, i });
        job.repeatEvery(cron);
        job.priority(schedule.priority)
        await job.save();
      })
    );
  }
}

module.exports = new Scheduler();
