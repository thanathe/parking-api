const parkingLot = require('../lib/v1/parking')
const libMySQL = require('../lib/v1/mysql-db')
require('dotenv').config()
libMySQL.connect();

test('create parking lot', async () => {
    expect.assertions(3)
    const result = await parkingLot.createParkingLot('S', 1)
    const result2 = await parkingLot.createParkingLot('M', 2)
    const result3 = await parkingLot.createParkingLot('L', 3)
    expect(typeof result).toBe('object')
    expect(typeof result2).toBe('object')
    expect(typeof result3).toBe('object')
})



test('park the car', async () => {
    expect.assertions(2)
    const result = await parkingLot.parkCar('M', 'MM-9999')
    expect(result).toHaveProperty('slot_number')
    expect(result).toHaveProperty('slot_size')
})

test('leave slot', async () => {
    const result = await parkingLot.leaveSlot('MM-9999')
    expect(result).toBe(true)
})


test('parking lot status', async () => {
    expect.assertions(4)
    const result = await parkingLot.parkingStatus()
    expect(Array.isArray(result)).toBe(true)
    expect(result[0]).toHaveProperty('slot_number')
    expect(result[0]).toHaveProperty('slot_size')
    expect(result[0]).toHaveProperty('is_available')
})

test('get slot allocated by car size', async () => {
    expect.assertions(1)
    const result = await parkingLot.getSlotAllocatedByCarSize('M')
    expect(Array.isArray(result)).toBe(true)
})

test('get plate number by car size', async () => {
    expect.assertions(2)
    const result = await parkingLot.getPlateNumber('M')
    expect(Array.isArray(result)).toBe(true)
    expect(/.{2,3}-.{1,4}/ig.test(result[0])).toBe(true)
})

