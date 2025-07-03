const cron = require('node-cron');
const bookingService = require('../../services/booking-services');

function scheduleCrons() {
  cron.schedule('*/10  * * * *', async () => {
    try {
      console.log('[CRON] Running cancelOldBookings...');
      await bookingService.cancelOldBookings();

    } catch (error) {
      console.error('[CRON] Error in cancelOldBookings:', error);
    }
  });
}

module.exports = scheduleCrons;
