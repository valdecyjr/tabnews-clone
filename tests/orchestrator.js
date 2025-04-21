import retry from "async-retry";
require("dotenv").config();

const webserver_url = process.env.WEBSERVER_URL;

async function waitForAllServices() {
  await waitForWebServer();

  async function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchStatusPage() {
      const response = await fetch(`${webserver_url}/api/v1/status`);
      if (response.status !== 200) {
        throw new Error(`Status page not available, got ${response.status}`);
      }
    }
  }
}

const orchestrator = {
  waitForAllServices,
};

export default orchestrator;
