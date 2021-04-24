/* jshint node:true */
'use strict';

const _ = require('lodash');
const promise = require('bluebird');

const createParkingLot = async (size, num_of_slot) => {
    let querySQL = 'INSERT INTO parking_slot(size) VALUES '
    let queryParams = [];
    for (var i=0; i<num_of_slot; i++) {
        querySQL += ((queryParams.length?',':'') + ' (?)')
        queryParams.push(size)
    }
    
    return await global.connection.query(querySQL, queryParams)
}

const checkSlotAvailable = async (car_size, limit=1) => {
    return new promise.Promise((resolve) => {
        let querySQL = "SELECT id, slot_size FROM parking_slot WHERE slot_size IN ";
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
        querySQL += " AND plate_number IS NULL ORDER BY FIELD(`slot_size`, 'S', 'M', 'L'), `slot_size`, id LIMIT ?";
        global.connection.query(querySQL, [limit], (err, results, fields) => {
            console.log('checkslot', results)
            if (err) resolve(false)
            if (results?.length) 
                resolve(results[0])
            else resolve(false)
        })
    })
}

const getSlotAvailableByCarSize = async (car_size) => {
    return new promise.Promise((resolve) => {
        let querySQL = "SELECT * FROM parking_slot WHERE slot_size = ? AND plate_number IS NOT NULL ";
        global.connection.query(querySQL, [car_size], (err, results, fields) => {
            console.log('checkslot', results)
            if (err) resolve(false)
            if (results?.length) 
                resolve(results)
            else resolve(false)
        })
    })
}

const parkCar = async (car_size, plate_number) => {
    const parkingSlot = await checkSlotAvailable(car_size)
    if (!parkingSlot) {
        return (false)
    }
    global.connection.query("UPDATE parking_slot SET plate_number = ?, car_size = ?, time_in=NOW() WHERE id = ?", [plate_number, car_size, parkingSlot.id])
    return (parkingSlot)
}

const leaveSlot = async (plate_number) => {
    return new promise.Promise((resolve) => {
        global.connection.query("SELECT * FROM parking_slot WHERE plate_number=?", [plate_number], (err, results, fields) => {
            console.log('leave', err, results)
            if (err) {
                throw new Error(err)
            } else {
                if (results.length) {
                    const { id } = results[0]
                    console.log('leave slot:', id)
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
        global.connection.query("SELECT * FROM parking_slot", [], (err, results, fields) => {
            if (err) resolve(false)
            if (results?.length) 
                resolve(results)
            else resolve(false)
        })
    })
}

const getPlateNumber = async (size) => {
    return new promise.Promise((resolve, reject) => {
        global.connection.query("SELECT plate_number FROM parking_slot WHERE car_size=? AND plate_number IS NOT NULL", [size], (err, results, fields) => {
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
    getSlotAvailableByCarSize,
    parkingStatus,
    createParkingLot,
    parkCar,
    leaveSlot,
}