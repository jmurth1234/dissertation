const process = require("child_process");

const command = (cmd, args) => process.spawn(cmd, args.split(" "));

module.exports = command