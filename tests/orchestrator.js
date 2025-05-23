import retry from "async-retry";
import database from "infra/database";
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

async function clearDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
};

export default orchestrator;
