const axios = require("axios");
const express = require("express");

// Create Express instance
const app = express();
const ZAP_API_URL = process.env.ZAP_API_URL;

// Define a route
app.get("/", async (req, res) => {
  await startScan("https://ossamarafique.com").catch(console.error);

  res.send("Hello, World!");
});

async function startScan(url) {
  // Start a new session
  const newSessionResponse = await axios.get(
    `${ZAP_API_URL}/core/action/newSession/?name=new_session&overwrite=true`
  );
  console.log("New session created:", newSessionResponse.data);

  // Start the spider
  const spiderResponse = await axios.get(
    `${ZAP_API_URL}/spider/action/scan/?url=${encodeURIComponent(
      url
    )}&recurse=true`
  );
  console.log("Spider started:", spiderResponse.data);

  // Poll ZAP for scan progress
  let progress = 0;
  while (progress < 100) {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const progressResponse = await axios.get(
      `${ZAP_API_URL}/spider/view/status/?scanId=${spiderResponse.data.scan}`
    );
    progress = parseInt(progressResponse.data.status);
    console.log("Spider progress:", progress, "%");
  }

  // Retrieve and display the alerts
  const alertsResponse = await axios.get(
    `${ZAP_API_URL}/core/view/alerts/?baseurl=${encodeURIComponent(
      url
    )}&start=0&count=0`
  );
  console.log("Alerts:", alertsResponse.data.alerts.length);
  console.log(alertsResponse.data.alerts);

  // // Shutdown ZAP
  // const shutdownResponse = await axios.get(
  //   `${ZAP_API_URL}/core/action/shutdown/`
  // );
  // console.log("ZAP shutdown:", shutdownResponse.data);
}

// Start the server
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
