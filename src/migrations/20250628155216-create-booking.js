'use strict';
/** @type {import('sequelize-cli').Migration} */
const { Enums } = require('../utils/common');
const{PENDING,CONFIRMED, CANCELLED, COMPLETED,INITIATED, FAILED, REFUNDED, ON_HOLD,IN_PROGRESS, EXPIRED, RESCHEDULED, PARTIALLY_REFUNDED, AWAITING_REFUND}=Enums.BookingStatus;
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Bookings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      flightId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM,
        values: [
          PENDING, CONFIRMED, CANCELLED, COMPLETED, INITIATED, FAILED,
          REFUNDED, ON_HOLD, IN_PROGRESS, EXPIRED, RESCHEDULED,
          PARTIALLY_REFUNDED, AWAITING_REFUND
        ],
        defaultValue: INITIATED,
        allowNull: false
      },
      noOfSeats: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      totalCost: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Bookings');
  }
};