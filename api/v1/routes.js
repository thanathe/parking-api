/* jshint node:true */
'use strict';

module.exports = [
    // ['parking/list', 'v1/parking#listParking', 'get'],
    ['parking/status', 'v1/parking#parkingStatus', 'get'],
    ['parking/list-plate-by-size', 'v1/parking#getPlateNumber', 'get'],
    ['parking/list-slot-by-size', 'v1/parking#getSlotAvailableByCarSize', 'get'],
    ['parking/create-lot', 'v1/parking#createParkingLot', 'post'],
    ['parking/park', 'v1/parking#parkCar', 'post'],
    ['parking/leave', 'v1/parking#leaveSlot', 'post'],
];
