const{StatusCodes}=require('http-status-codes');
const{SuccessResponse,ErrorResponse}=require('../utils/common');
const axios = require('axios');
const{}=require('../repositories');
const db=require('../models');
const { serverConfig } = require('../config'); 
const AppError = require('../utils/errors/app-error');
const { message } = require('../utils/common/success-response');
const{ BookingRepository } = require('../repositories');


const bookingRepository = new BookingRepository();
async function createBooking(data) {
    const transaction = await db.sequelize.transaction();
    try{
        const flight = await axios.get(`${serverConfig.FLIGHT_SERVICE_URL}/api/v1/flights/${data.flightId}`);

        const flightData = flight.data.data;

        if (data.noOfSeats > flightData.totalSeats) {
            throw new AppError('Not enough seats available', StatusCodes.BAD_REQUEST);
        }
        const totalBillingAmount = flightData.price * data.noOfSeats;
        const bookingPayload = {...data, totalCost:totalBillingAmount};

        const booking=await this.bookingRepository.createBooking(bookingPayload, transaction);

        await axios.patch(`${serverConfig.FLIGHT_SERVICE_URL}/api/v1/flights/${data.flightId}/seats`, {
            noOfSeats: data.noOfSeats
        });
        
        await transaction.commit();
        return booking;
    }catch(error){
        await transaction.rollback();
        throw error;
    }
}


module.exports = {
    createBooking
}