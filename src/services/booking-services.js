const axios = require('axios');
const { StatusCodes } = require('http-status-codes');

const { BookingRepository } = require('../repositories');
const { serverConfig, Queue } = require('../config'); 
const db = require('../models');
const AppError = require('../utils/errors/app-error');
const { Enums } = require('../utils/common');
const { PENDING, CONFIRMED, CANCELLED } = Enums.BookingStatus;

const bookingRepository = new BookingRepository();

async function createBooking(data) {
    const transaction = await db.sequelize.transaction();
    try {
        const flight = await axios.get(`${serverConfig.FLIGHT_SERVICE_URL}/api/v1/flights/${data.flightId}`); 
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

        if (currentTime - bookingTime > 300000) { // 5 minutes
            await cancelBooking(data.bookingId);
            throw new AppError('The booking has expired', StatusCodes.BAD_REQUEST);
        }

        if (bookingDetails.totalCost !== data.totalCost) {
            throw new AppError('The amount of the payment does not match', StatusCodes.BAD_REQUEST);
        }

        if (bookingDetails.userId !== data.userId) {
            throw new AppError('The user corresponding to the booking does not match', StatusCodes.BAD_REQUEST);
        }

        // Assume payment is successful
        await bookingRepository.update(data.bookingId, { status: CONFIRMED }, transaction);

        Queue.sendData({
            recepientEmail: 'cs191297@gmail.com',
            subject: 'Flight booked',
            text: `Booking successfully done for the booking ${data.bookingId}`
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
        console.log("Inside cancelOldBookings service...");
        const time = new Date(Date.now() - 1000 * 300); // 5 minutes ago
        const response = await bookingRepository.cancelOldBookings(time);
        return response;
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    createBooking,
    makePayment,  
    cancelOldBookings
};
