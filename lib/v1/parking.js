/* jshint node:true */
'use strict';

const _ = require('lodash');
const promise = require('bluebird');

const createParkingLot = async (size, num_of_slot) => {
    return new promise.Promise((resolve) => {
        let querySQL = 'INSERT INTO parking_slot(slot_size) VALUES '
        let queryParams = [];
        for (var i=0; i<num_of_slot; i++) {
            querySQL += ((queryParams.length?',':'') + ' (?)')
            queryParams.push(size)
        }
        global.connection.query(querySQL, queryParams, (err, results, fields) => {
            if (err) {
                console.log(err)
                resolve(false)
            } else 
                resolve(results)
        })
    })
    
}

const checkSlotAvailable = async (car_size, plate_number, limit=1) => {
    return new promise.Promise((resolve) => {
        let querySQL = "SELECT id, slot_size, plate_number FROM parking_slot WHERE slot_size IN ";
        switch (car_size) {
            case 'S': 
                querySQL += "('S', 'M', 'L')"
                break;
            case 'M': 
                querySQL += "('M', 'L')"
                break;
            case 'L': 
                querySQL += "('L')"
                break;
            default:
                return "Invalid Car Size";
        }
        querySQL += " AND plate_number IS NULL OR plate_number = ? ORDER BY FIELD(`slot_size`, 'S', 'M', 'L'), `slot_size`, id LIMIT ?";
        global.connection.query(querySQL, [plate_number, limit], (err, results, fields) => {
            if (err) resolve(false)
            if (results?.length) 
                resolve(results[0])
            else resolve(false)
        })
    })
}

const getSlotAllocatedByCarSize = async (car_size) => {
    return new promise.Promise((resolve) => {
        let querySQL = "SELECT * FROM parking_slot WHERE car_size = ? AND plate_number IS NOT NULL ";
        global.connection.query(querySQL, [car_size], (err, results, fields) => {
            if (err) resolve(false)
            if (results?.length) {
                let returnRes = []
                _.forEach(results, (slot)=>{
                    returnRes.push(_.assign(slot, {
                        slot_number: slot.slot_size + '-' + slot.id
                    }))
                })
                resolve(returnRes)
            }
            else resolve([])
        })
    })
}

const parkCar = async (car_size, plate_number) => {
    const parkingSlot = await checkSlotAvailable(car_size, plate_number)
    console.log('parking slot', parkingSlot)
    if (!parkingSlot) {
        return (false)
    } else if (parkingSlot.plate_number) {
        return { 
            status: 'already_parked',
            plate_number: parkingSlot.plate_number,
            slot_number: parkingSlot.slot_size + '-' + parkingSlot.id,
            slot_size: parkingSlot.slot_size
        }
    } else {
        global.connection.query("UPDATE parking_slot SET plate_number = ?, car_size = ?, time_in=NOW() WHERE id = ?", [plate_number, car_size, parkingSlot.id])
        let resultData = _.assign({
            slot_number: parkingSlot.slot_size + '-' + parkingSlot.id
        }, parkingSlot)
        delete resultData.id;
        return resultData
    }
}

const leaveSlot = async (plate_number) => {
    return new promise.Promise((resolve) => {
        global.connection.query("SELECT * FROM parking_slot WHERE plate_number=?", [plate_number], (err, results, fields) => {
            if (err) {
                throw new Error(err)
            } else {
                if (results.length) {
                    const { id } = results[0]
                    global.connection.query("UPDATE parking_slot SET plate_number=null, time_in=null, car_size=null WHERE id=?", [id])
                    resolve(true)
                } else {
                    resolve(false)
                }
            }
        })
    })
}

const parkingStatus = (slot) => {
    return new promise.Promise((resolve) => {
        global.connection.query("SELECT plate_number, slot_size, car_size, time_in, CONCAT(CONCAT(slot_size, '-'), id) as slot_number FROM parking_slot", [], (err, results, fields) => {
            if (err) resolve(false)
            if (results?.length) {
                let returnRes = []
                _.forEach(results, (slot)=>{
                    let data = {
                        slot_number: slot.slot_number,
                        slot_size: slot.slot_size,
                        is_available: slot.plate_number===null?true:false
                    }
                    if (slot.plate_number !== null) {
                        data.plate_number = slot.plate_number
                    }
                    returnRes.push(data)
                })
                resolve(returnRes)
            }
            else resolve(false)
        })
    })
}

const getPlateNumber = async (car_size) => {
    return new promise.Promise((resolve, reject) => {
        global.connection.query("SELECT plate_number FROM parking_slot WHERE car_size=? AND plate_number IS NOT NULL", [car_size], (err, results, fields) => {
            if (err) {
                resolve(false);
            } else if (results.length) {
                resolve(results.map((x) => x.plate_number))
            } else {
                resolve([]);
            }
        })
    })
}

module.exports = {
    getPlateNumber,
    getSlotAllocatedByCarSize,
    parkingStatus,
    createParkingLot,
    parkCar,
    leaveSlot,
}