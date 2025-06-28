const SEAT_TYPES = Object.freeze({
  ECONOMY: 'economy',
  PREMIUM_ECONOMY: 'premium_economy',
  ECONOMY_PLUS: 'economy_plus',      
  BUSINESS: 'business',
  FIRST_CLASS: 'first_class',
  BULKHEAD: 'bulkhead',           
  EXIT_ROW: 'exit_row',          
  LUXURY_BUSINESS: 'luxury_business',  
});

const BookingStatus = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  INITIATED: 'initiated',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  ON_HOLD: 'on_hold',
  IN_PROGRESS: 'in_progress',
  EXPIRED: 'expired',
  RESCHEDULED: 'rescheduled',
  PARTIALLY_REFUNDED: 'partially_refunded',
  AWAITING_REFUND: 'awaiting_refund',
});

module.exports = { 
  SEAT_TYPES,
  BookingStatus
 };