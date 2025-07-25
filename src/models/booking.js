'use strict';
const {
  Model
} = require('sequelize');
const { Enums } = require('../utils/common');
const{PENDING,CONFIRMED, CANCELLED, COMPLETED,INITIATED, FAILED, REFUNDED, ON_HOLD,IN_PROGRESS, EXPIRED, RESCHEDULED, PARTIALLY_REFUNDED, AWAITING_REFUND}=Enums.BookingStatus;
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Booking.init({
    flightId:{
      type:DataTypes.INTEGER,
      allowNull: false
    },
    userId:{
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status:{
      type: DataTypes.ENUM,
      values: [PENDING, CONFIRMED, CANCELLED, COMPLETED, INITIATED, FAILED, REFUNDED, ON_HOLD, IN_PROGRESS, EXPIRED, RESCHEDULED, PARTIALLY_REFUNDED, AWAITING_REFUND],
      defaultValue: INITIATED,
      allowNull: false
    },
    noOfSeats: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    totalCost: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Booking',
  });
  return Booking;
};