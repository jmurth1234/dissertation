const yup = require("yup");

const ScheduledRecord = yup.object().shape({
  _id: yup.string().nullable(),

  // time of the day to start the task
  startHour: yup.number().min(0).max(23),
  startMinute: yup.number().min(0).max(59),

  // time of the day to end the task
  endHour: yup.number().min(0).max(23).moreThan(yup.ref("startHour")),
  endMinute: yup
    .number()
    .min(0)
    .max(59)
    .when(["startHour", "endHour"], {
      is: (start, end) => start === end,
      then: yup.number().moreThan(yup.ref("startMinute")),
    }),

  // which days of the week to run on
  daysRunning: yup.array().of(yup.number().min(0).max(6)),

  // gap between each video, in minutes
  runEvery: yup.number().default(1).min(1),

  // time to record in seconds
  runFor: yup.number().default(30).min(1),

  // priority of recording
  priority: yup.number().min(0),

  // framerate, max 60 fps
  framerate: yup.number().default(5).min(1).max(60),

  // how often to check for motion, in frames
  motionAccuracy: yup.number().default(2).min(1).max(5),

  // how sensitive the camera is to motion
  motionSensitivity: yup.number().default(5).min(1).max(10),

  // whether to always upload or only with motion
  alwaysUpload: yup.boolean().default(false),

  // optional display comment
  comment: yup.string().nullable(),
});

module.exports = ScheduledRecord;
