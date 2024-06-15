const config = require("../../config/server.json");

class Integrations {
  constructor() {
    if (config.integration === "google") {
      this.integration = require("./google");
    }

    this.attemptAuth();
  }

  async attemptAuth() {
    this.authed = await this.integration.authorize();
  }

  beginLogin() {
    return this.integration.beginLogin();
  }

  async completeLogin(code) {
    this.authed = await this.integration.completeLogin(code);
  }

  async uploadFile(filename, path, startTime, motionStart) {
    const result = await this.integration.uploadFile(filename, path);

    await this.sendUploadResult(
      startTime,
      motionStart,
      result.data.webViewLink
    );
  }

  async sendEmail(subject, content) {
    return this.integration.sendEmail(subject, content);
  }

  async sendMotionEmail(startTime) {
    return this.sendEmail(
      "Motion Detected",
      `Motion was detected by ${config.cameraName} in the recording that started at ${startTime}\n\n` +
        "You will get another email once this footage is ready to view"
    );
  }

  async sendUploadResult(startTime, motionStart, link) {
    const motionStr =
      motionStart === NaN
        ? "No motion was detected"
        : `The detected movement starts around ${motionStart} seconds`;

    return this.sendEmail(
      "Video Uploaded",
      `The recording that started at ${startTime} has been successfully uploaded\n\n` +
        `You can view it at ${link}. ${motionStr}`
    );
  }
}

module.exports = new Integrations();
