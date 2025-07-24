const db = require('../models');
const axios = require('axios');
const { StatusCodes } = require('http-status-codes');
const { BookingRepository } = require('../repositories');
const { serverConfig, Queue } = require('../config');
const AppError = require('../utils/errors/app-error');
const { Enums } = require('../utils/common');
const { PENDING, CONFIRMED, CANCELLED } = Enums.BookingStatus;

const bookingRepository = new BookingRepository();

const BOOKING_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

async function createBooking(data) {
  const transaction = await db.sequelize.transaction();
  try {
    const flight = await axios.get(`${serverConfig.FLIGHT_SERVICE_URL}/api/v1/flights/${data.flightId}`);

    if (!flight.data || !flight.data.data) {
      throw new AppError('Flight data not found', StatusCodes.INTERNAL_SERVER_ERROR);
    }

    const flightData = flight.data.data;

    if (data.noOfSeats > flightData.totalSeats) {
      throw new AppError('Not enough seats available', StatusCodes.BAD_REQUEST);
    }

    const totalBillingAmount = data.noOfSeats * flightData.price;
    const bookingPayload = { ...data, totalCost: totalBillingAmount };

    const booking = await bookingRepository.createBooking(bookingPayload, transaction);

    await axios.patch(`${serverConfig.FLIGHT_SERVICE_URL}/api/v1/flights/${data.flightId}/seats`, {
      seats: data.noOfSeats
    });

    await transaction.commit();
    return booking;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function makePayment(data) {
  const transaction = await db.sequelize.transaction();
  try {
    const bookingDetails = await bookingRepository.get(data.bookingId, transaction);

    if (bookingDetails.status === CANCELLED) {
      throw new AppError('The booking has expired', StatusCodes.BAD_REQUEST);
    }

    const bookingTime = new Date(bookingDetails.createdAt);
    const currentTime = new Date();

    if (currentTime - bookingTime > BOOKING_EXPIRY_TIME) {
      await cancelBooking(data.bookingId);
      throw new AppError('The booking has expired', StatusCodes.BAD_REQUEST);
    }
    console.log('DB cost:', bookingDetails.totalCost);
  console.log('Received cost:', data.totalCost);

   if (parseFloat(bookingDetails.totalCost).toFixed(2) !== parseFloat(data.totalCost).toFixed(2)) {
    throw new AppError('The amount of the payment doesn’t match', StatusCodes.BAD_REQUEST);
}

  console.log('DB userId:', bookingDetails.userId);
  console.log('Received userId:', data.userId);
    if (parseInt(bookingDetails.userId) !== parseInt(data.userId)) {
    console.log('Type mismatch:', typeof bookingDetails.userId, typeof data.userId);
    throw new AppError('The user corresponding to the booking doesn’t match', StatusCodes.BAD_REQUEST);
}


    // Assuming payment is successful
    await bookingRepository.update(data.bookingId, { status: CONFIRMED }, transaction);

    // Optional: await this if queue sendData returns a Promise
    Queue.sendData({
      recepientEmail: 'nandanbharadwaj4@gmail.com',
      subject: 'Flight booked',
      content: `Booking successfully done for the booking ${data.bookingId}`
    });

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function cancelBooking(bookingId) {
  const transaction = await db.sequelize.transaction();
  try {
    const bookingDetails = await bookingRepository.get(bookingId, transaction);

    if (bookingDetails.status === CANCELLED) {
      await transaction.commit();
      return true;
    }

    await axios.patch(`${serverConfig.FLIGHT_SERVICE_URL}/api/v1/flights/${bookingDetails.flightId}/seats`, {
      seats: bookingDetails.noOfSeats,
      dec: 0
    });

    await bookingRepository.update(bookingId, { status: CANCELLED }, transaction);
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function cancelOldBookings() {
  try {
    console.log("Checking and cancelling old bookings...");
    const time = new Date(Date.now() - BOOKING_EXPIRY_TIME); // 5 minutes ago
    const response = await bookingRepository.cancelOldBookings(time);
    return response;
  } catch (error) {
    console.log('Error cancelling old bookings:', error);
  }
}

module.exports = {
  createBooking,
  makePayment,
  cancelBooking,
  cancelOldBookings
};
