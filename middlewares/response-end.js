/* jshint node:true */
'use strict';

/**
 * Do something on response ending events.
 */
module.exports.onResponseEnd = function (closeHandler, finishHandler) {
    return function (req, res, next) {
        var that = {
            req: req,
            res: res
        };
        if (closeHandler && typeof (closeHandler) === 'function')
            res.on('close', closeHandler.bind(that));
        if (finishHandler && typeof (finishHandler) === 'function')
            res.on('finish', finishHandler.bind(that));
        next();
    };
};
