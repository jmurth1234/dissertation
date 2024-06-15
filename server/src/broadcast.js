// import the module
const mdns = require("mdns");

module.exports = () => {
  // advertise a http server on port 4321
  const ad = mdns.createAdvertisement(mdns.tcp("http", "camera-server"), 3000);

  ad.start()
};
