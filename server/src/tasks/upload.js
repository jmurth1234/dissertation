const Integrations = require("../integrations");
const fs = require("fs");
const { promisify } = require("util");
const rm = promisify(fs.unlink);

/**
 * Runs the job to upload content from the camera
 *
 * @param {any} Database
 * @param {Agenda.Job} job
 * @param {Function} done
 */
async function uploadJob(Database, done) {
  const videos = await Database.getUploadQueue();

  console.log(`Uploading ${videos.length} videos`);

  for (const video of videos) {
    const { _id, filename, filePath, videoStart, motionStartSeconds } = video;
    try {
      await Integrations.uploadFile(
        filename,
        filePath,
        videoStart,
        motionStartSeconds
      );

      await Database.completeQueueItem(_id);
      await rm(filePath);
    } catch (e) {
      console.error("failed to upload", e);
    }
  }

  done();
}

module.exports = (Database) => {
  return (job, cb) => uploadJob(Database, cb);
};
