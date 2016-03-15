'use strict'

var bleno = require('bleno');

/*
BLE Tests ! 

*/

// Characteristic

var uuidCharacteristic = '11111111222233334444000000000010';

// new characteristic added to the service
var CharTest = new bleno.Characteristic({
    uuid : uuidCharacteristic,
    properties : ['read','writeWithoutResponse'],
    descriptors:[
    	new bleno.Descriptor({
    		uuid:'2901',
    		value: 'test Descriptor ! '
    	})
    ],
    onReadRequest : function(offset, callback) {
    	if (offset){
    		callback(bleno.Characteristic.RESULT_ATTR_NOT_LONG, null);
    	}else{
    		var data = new Buffer(1);
		    data.writeUInt8(1, 0);
		    callback(this.RESULT_SUCCESS, data);
    	}
        /*if(offset > data.length) {
            callback(bleno.Characteristic.RESULT_INVALID_OFFSET);
        } else {
            callback(bleno.Characteristic.RESULT_SUCCESS, data.slice(offset));
        }*/
    },
    onWriteRequest : function(newData, offset, withoutResponse, callback) {
        if(offset > 0) {
            callback(bleno.Characteristic.RESULT_INVALID_OFFSET);
        } else {
            console.log(newData.toString('utf8'));
            data = newData;
            callback(bleno.Characteristic.RESULT_SUCCESS);
        }
    }
})

// Service

var uuidService = '11111111222233334444000000000000';

var myTestService =  new bleno.PrimaryService({
    uuid : uuidService,
    characteristics : [
        CharTest
    ]
});

// Bleno

bleno.on('stateChange', function(state) {
    console.log('on -> stateChange: ' + state);
    if (state === 'poweredOn') {
        bleno.startAdvertising('MyDevice',[uuidService]);
    } else {
        bleno.stopAdvertising();
    }
});

var data = new Buffer('Send me some data to display');

bleno.on('advertisingStart', function(error) {
    console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));
    if (!error) {
        bleno.setServices([myTestService]);
    }
});
