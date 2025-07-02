const {StatusCodes}=require('http-status-codes');

const {Booking}=require('../models')
const CrudRepository=require('./crud-repository')

class BookingRepository extends CrudRepository{
    constructor(){
        super(Booking);
    }
    async createBooking(data,transaction){
        try{
            const booking=await Booking.create(data,{transaction});
            return booking;
        }catch(error){
            if(error.name==='SequelizeValidationError'){
                throw {
                    statusCode:StatusCodes.BAD_REQUEST,
                    message:error.errors[0].message
                }
            }
            throw {
                statusCode:StatusCodes.INTERNAL_SERVER_ERROR,
                message:error.message || 'Something went wrong'
            }
        }
    }
}

module.exports= BookingRepository;