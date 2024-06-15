const mdns = require("mdns");
const fetch = require("node-fetch");

const hosts = {};

const browser = mdns.createBrowser(mdns.tcp("http", "camera-server"));

mdns.Browser.defaultResolverSequence[1] =
  "DNSServiceGetAddrInfo" in mdns.dns_sd
    ? mdns.rst.DNSServiceGetAddrInfo()
    : mdns.rst.getaddrinfo({ families: [4] });

browser.on("serviceUp", (service) => {
  // ignore duplicate ups
  if (hosts[service.name]) return;

  hosts[service.name] = service;
  console.log(`${service.name} at ${service.addresses[0]} up`);
});

browser.on("serviceDown", (service) => {
  // ignore duplicate downs
  if (!hosts[service.name]) return;

  var device = hosts[service.name];

  delete hosts[service.name];

  console.log(`${device.name} at ${device.addresses[0]} down`);
});

browser.start();

async function shouldRecord(currentJob) {
  for (const host of Object.values(hosts)) {
    const domain = `http://${host.addresses[0]}:${host.port}/current-job`;

    const req = await fetch(domain);
    const res = await req.json();

    if (currentJob._id === res.id) {
      // same job so skip
      continue;
    }

    if ((currentJob.priority < res.current.priority) && res.hasMotion) {
      return false;
    }
  }
  return true;
}

module.exports = shouldRecord;
