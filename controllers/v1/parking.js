/* jshint node:true */
'use strict';

const libParking = require('../../lib/v1/parking')
const _ = require('lodash')

const createParkingLot = async (req, res) => {
    // สร้างช่องจอด 
    const { size, num_of_slot } = req.body;
    const parkingLot = await libParking.createParkingLot(size, num_of_slot)
    if (parkingLot) {
        return res.json({result: 0, data: 'create parking lot success'})
    } else {
        return res.json({result: 1, msg: 'create parking lot fail'})
    }
    
}

const parkCar = async (req, res) => {
    // จอง
    const { car_size, plate_number } = req.body
    if (!car_size || !plate_number) {
        res.json({result: 1, msg: 'missing params'})
    }
    const slot = await libParking.parkCar(car_size, plate_number)
    if (!slot) {
        return res.json({result: 1, msg: "parking slot full"})
    } else if (slot.status === 'already_parked') {
        return res.json({
            result: 0, 
            status: 'already_parked', 
            data: {
                id: slot.id, 
                plate_number: slot.plate_number
            }
        })
    } else {
        slot.plate_number = plate_number
        return res.json({result: 0, data: slot});
    }
    
}

const leaveSlot = async (req, res) => {
    const { plate_number } = req.body
    const result = await libParking.leaveSlot(plate_number)
    console.log('leave result:', result);
    if (result) {
        res.json({result: 0, msg: 'leave slot success'})
    } else {
        res.json({result: 1, msg: 'invalid plate number'})
    }
    
}

// get registration plate number list by car size

const getPlateNumber = async (req, res) => {
    const { car_size } = req.body;
    if (['S', 'M', 'L'].includes(car_size)) {
        const plateNumbers = await libParking.getPlateNumber(car_size)
        console.log(plateNumbers);
        res.json({
            result: 0,
            data: {
                plate_numbers: plateNumbers
            }
        })
    } else {
        res.json({
            result: 1, 
            msg: 'invalid car size'
        })
    }
    
}

const getSlotAllocatedByCarSize = async (req, res) => {
    const { car_size } = req.body;
    const slots = await libParking.getSlotAllocatedByCarSize(car_size)
    res.json({result: 0, data: {slots: slots}})
}

const parkingStatus = async (req, res) => {
    const { slot_id } = req.body;
    let parkingStatus = await libParking.parkingStatus()
    res.json({result: 0, data: parkingStatus})
}

module.exports = {
    getPlateNumber,
    getSlotAllocatedByCarSize,
    parkingStatus,
    createParkingLot,
    parkCar,
    leaveSlot,
}