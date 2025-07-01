const{StatusCodes}=require('http-status-codes');
const{SuccessResponse,ErrorResponse}=require('../utils/common');
const axios = require('axios');
const{}=require('../repositories');
const db=require('../models');
const { serverConfig } = require('../config'); 
const AppError = require('../utils/errors/app-error');
const { message } = require('../utils/common/success-response');



async function createBooking(data) {
    const result = await db.sequelize.transaction(async function bookingImpl(t) {
        const flight = await axios.get(`${serverConfig.FLIGHT_SERVICE_URL}/api/v1/flights/${data.flightId}`);
        const flightData = flight.data.data;

        if (data.noOfSeats > flightData.totalSeats) {
            throw new AppError('Not enough seats available', StatusCodes.BAD_REQUEST);
        }

        // TODO: Create booking logic goes here (insert into bookings table, etc.)

        return true; // this gets returned from transaction
    });

    return result;
}


module.exports = {
    createBooking
}