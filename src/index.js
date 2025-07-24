const express = require('express');
const amqplib = require("amqplib");

const {serverConfig,Queue}= require('./config');
const apiRoutes = require('./routes');
const CRON = require('./utils/common/cron-jobs');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api',apiRoutes);
app.use('/bookingService/api',apiRoutes);

app.listen(serverConfig.PORT, async() => {
  console.log(`Server is running on port ${serverConfig.PORT}`);

  CRON();
  await Queue.connectQueue();
  console.log("Connected to RabbitMQ");
});