const express = require('express');

const {serverConfig}= require('./config');
const apiRoutes = require('./routes');
const app = express();
const CRON = require('./utils/common/cron-jobs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api',apiRoutes);
//app.use('/bookingService/api',apiRoutes);

app.listen(serverConfig.PORT, () => {
  console.log(`Server is running on port ${serverConfig.PORT}`);

  CRON();
});