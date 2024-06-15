const yup = require("yup");

module.exports = yup.object().shape({
  filename: yup.string().required(),
  filePath: yup.string().required(),
  videoStart: yup.string().required(),
  motionStartSeconds: yup.number(),
  completed: yup.bool()
})