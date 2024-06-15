const cv = require("opencv4nodejs");
const Agenda = require("agenda");
const fs = require("fs");
const { promisify } = require("util");
const through2 = require("through2");
const stream = require("stream");
const cameraStream = require("../utils/camera-stream");
const shouldRecord = require("../utils/should-record");
const Integrations = require("../integrations");

const size = new cv.Size(15, 15);
const mkdir = promisify(fs.mkdir);
const rm = promisify(fs.unlink);

/**
 * Generates a blurred representation of the frame
 *
 * @param {cv.Mat} frame frame to blur
 * @returns {Promise<cv.Mat>} The blurred frame
 */
async function generateBlur(frame) {
  let output = await frame.cvtColorAsync(cv.COLOR_BGR2GRAY);
  output = await output.blurAsync(size);

  return output;
}

/**
 * Runs the job to record content from the camera
 *
 * @param {any} Database
 * @param {any} Scheduler the current scheduler instance
 * @param {Agenda.Job} job
 * @param {Function} done
 */
async function cameraJob(Database, Scheduler, job, done) {
  const schedule = job.attrs;

  const record = await shouldRecord(schedule.data)
  if (!record) {
    return done();
  }

  const videoStart = schedule.lastRunAt.toISOString();
  await mkdir(`/tmp/frames/${videoStart}/`, { recursive: true });

  cameraStream.setFramerate(schedule.data.framerate);

  const fps = cameraStream.fps;

  const code = cv.VideoWriter.fourcc("MJPG");
  const file = `/tmp/frames/${videoStart}/out.avi`;
  const writer = new cv.VideoWriter(file, code, fps, new cv.Size(1280, 720));

  let firstFrame = cameraStream.camera.read();
  writer.write(firstFrame);

  firstFrame = await generateBlur(firstFrame);
  firstFrame = await firstFrame.convertToAsync(cv.CV_32F)

  let hasMotion = false;
  let maxFrames = fps * schedule.data.runFor;
  let motionStart, motionEnd, endFrame;

  console.log("recording for", maxFrames, "frames");

  const inStream = new stream.Readable({
    objectMode: true,
    read: function () {},
  });

  cameraStream.pipes.push(inStream);

  async function onComplete() {
    Scheduler.setMotion(false);
    console.log("motion was from", motionStart, motionEnd);

    const index = cameraStream.pipes.indexOf(inStream);
    if (index > -1) {
      cameraStream.pipes.splice(index, 1);
    }
    writer.release();

    if (schedule.data.alwaysUpload || motionStart !== undefined) {
      const motionStartSeconds = Math.round(motionStart / fps);

      await Database.addUploadQueue(
        `${videoStart}.avi`,
        file,
        videoStart,
        motionStartSeconds
      );
    } else {
      await rm(file);
    }

    done();
  }

  let hasCompleted = false;

  console.time("time record");

  const processFrame = through2.obj(async function (entry, enc, cb) {
    const { current, frame } = entry;
    if (hasCompleted) return;
    if (current % schedule.data.motionAccuracy === 0) {
      this.push(entry);

      return cb();
    }

    // halt the recording if it's 5x longer than the maxFrames
    if ((current > maxFrames && !hasMotion) || (current > maxFrames * 5)) {
      console.timeEnd("time record");

      if (!endFrame) {
        endFrame = current;
      }

      hasCompleted = true;
      onComplete();
    }

    console.time("blur " + current);
    let gray = await generateBlur(frame);
    console.timeEnd("blur " + current);

    try {
      await cv.accumulateWeightedAsync(firstFrame, gray, 0.5)
    } catch (e) {
      console.log(e)
    }

    //compute difference between first frame and current frame
    console.time("diff " + current);
    let frameDelta = gray.absdiff(firstFrame.convertScaleAbs(1, 0));
    let thresh = await frameDelta.thresholdAsync(25, 255, cv.THRESH_BINARY);
    
    var cnts = await thresh.findContoursAsync(
      cv.RETR_LIST,
      cv.CHAIN_APPROX_SIMPLE
    );
    console.timeEnd("diff " + current);

    hasMotion = false;
    Scheduler.setMotion(false);
    const total = 1280 * 720
    for (var i = 0; i < cnts.length; i++) {
      if (cnts[i].area < (schedule.data.motionSensitivity / 10) * total) {
        continue;
      }

      console.log("motion at frame", current, "with area", cnts[i].area);

      hasMotion = true;
      Scheduler.setMotion(true);

      if (motionStart === undefined) {
        try {
          await Integrations.sendMotionEmail(videoStart);
        } catch (e) {
          console.error("failed to send email", e);
        }
        motionStart = current;
      } else {
        motionEnd = current;
      }
    }

    this.push(entry);

    cb();
  });

  const saveFrame = through2.obj(async function (entry, enc, cb) {
    const { current, frame } = entry;

    console.time("save");
    console.log("saving", current);

    await writer.writeAsync(frame);
    console.timeEnd("save");

    cb();
  });

  inStream.pipe(processFrame).pipe(saveFrame);
}

module.exports = (Database, Scheduler) => {
  return (job, cb) => cameraJob(Database, Scheduler, job, cb);
};
