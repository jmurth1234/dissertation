const yup = require("yup");

module.exports = yup.object().shape({
  integration: yup.string().required(),
  email: yup.string().email().required(),
  cameraName: yup.string().required()
})