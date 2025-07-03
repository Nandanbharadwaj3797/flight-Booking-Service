const express = require('express');

const { bookingController } = require('../../controllers'); // ✅ lowercase b

const router = express.Router();

// /api/v1/bookings
router.post(
    '/',
    bookingController.createBooking
);

router.post(
    '/payments',
    bookingController.makePayment
);

module.exports = router;
