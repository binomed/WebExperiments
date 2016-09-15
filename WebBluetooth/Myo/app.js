'use strict'

// Get from https://github.com/chromakode/bicyclejs-talk/blob/07479fe3acfd722c930229d62ecadfa7ad3cdce3/src/myo.js

const controlService = 'd5060001-a904-deb9-4748-2c7f4a124842';
const gestureService = 'd5060003-a904-deb9-4748-2c7f4a124842';
const commandCharacteristic = 'd5060401-a904-deb9-4748-2c7f4a124842';
const gestureCharacteristic = 'd5060103-a904-deb9-4748-2c7f4a124842';
const enableGesturesCommand = new Uint8Array(5);
enableGesturesCommand[0] = 0x01; // set mode
enableGesturesCommand[1] = 0x03; // bytes in payload
enableGesturesCommand[2] = 0x00; // emg mode: none
enableGesturesCommand[3] = 0x00; // imu mode: disabled
enableGesturesCommand[4] = 0x01; // classifier mode: enabled

const disableGesturesCommand = Uint8Array.from(enableGesturesCommand);
disableGesturesCommand[4] = 0x00; // classifier mode: disabled

const deepSleepCommand = new Uint8Array(2);
deepSleepCommand[0] = 0x04; // set mode
deepSleepCommand[1] = 0x00; // bytes in payload

const shape = {
    filters: [{
        services: [controlService],
    }],
    optionalServices: [gestureService],
    listen: {
        [gestureService]: [
            gestureCharacteristic,
        ]
    },
};

(function() {

    let currentDevice = null;

    function parseMyoGesture(value) {
        if (value.getUint8(0) === 0x03) {
            const gestureValue = value.getUint16(1, true)
            const gesture = {
                0x0000: 'rest',
                0x0001: 'fist',
                0x0002: 'wave-in',
                0x0003: 'wave-out',
                0x0004: 'fingers-spread',
                0x0005: 'double-tap',
                0xffff: 'unknown',
            }[gestureValue]
            return { gesture }
        }
        return { gesture: null }
    }

    function pageLoad() {
        document.getElementById('connect').addEventListener('click', () => {
            navigator.bluetooth.requestDevice({
                    filters: [{
                        services: [controlService]
                    },{
                    	services: [gestureService]
                    }],
                    optionalServices: [controlService, gestureService]
                })
                .then(function(device) {
                    document.querySelector('.console').textContent = 'connecting...';
                    currentDevice = device;
                    return device.gatt.connect();
                })
                .then((server) => { console.log('server connected'); return currentDevice.gatt.getPrimaryService(controlService)})
                .then((service) => { console.log('control service retrieve'); return service.getCharacteristic(commandCharacteristic)})
                .then((characteristic) => { console.log('command characteristic retrieve'); return characteristic.writeValue(enableGesturesCommand)})
                .then(() => { console.log('characteristic write'); return currentDevice.gatt.getPrimaryService(gestureService)})
                .then((service) => { console.log('gesture service retrieve'); return service.getCharacteristic(gestureCharacteristic)})
                .then((characteristic) => {
                	console.log('characteristic retrieve');
                    characteristic.startNotifications();
                    characteristic.addEventListener('characteristicvaluechanged', (ev) => {
                        const gesture = parseMyoGesture(ev.target.value);
                        document.querySelector('.console').textContent = `Gesture : ${gesture}`;
                    })
                }).catch(function(error) {
                    console.error(error);
                    document.querySelector('.console').textContent = `Error ! `;
                });
        });
    }

    window.addEventListener('load', pageLoad);
})();
