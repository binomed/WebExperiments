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
            devicePromise = navigator.bluetooth.requestDevice(shape);

            gattPromise = devicePromise.then(function(device) {
                    document.querySelector('.console').textContent = 'connecting...';
                    currentDevice = device;
                    return device.gatt.connect();
                });
                
                /*.then((server) => {
                    document.querySelector('.console').textContent += '\n server connected'; 
                    return currentDevice.gatt.getPrimaryService(controlService)
                });*/
        });
        document.getElementById('getControlService').addEventListener('click', ()=>{
            gestureServicePromise = gattPromise.then(gatt => {
                document.querySelector('.console').textContent = 'Try to get Gesture'; 
                return gatt.getPrimaryService(gestureService)
            });
        });

        document.getElementById('getChar').addEventListener('click', ()=>{
            gestureServicePromise.then(service=>{
                document.querySelector('.console').textContent = 'Try to get characteristic';
                return service.getCharacteristic(gestureCharacteristic)
            });

        });
        document.getElementById('all').addEventListener('click', ()=>{
            navigator.bluetooth.requestDevice(shape)
                .then(function(device) {
                    console.info('Get Device, ', device);
                    console.info('Try to connecting');
                    document.querySelector('.console').textContent = 'connecting...';
                    currentDevice = device;
                    return device.gatt.connect();
                })
                .then(()=>{
                    console.info('Connect to myo device');
                    console.info('Try to get Control Service');
                    document.querySelector('.console').textContent = 'Try to get Control service'; 
                    return currentDevice.gatt.getPrimaryService(controlService)
                })      
                .then((service) => { 
                    console.info('Get Control Service');
                    console.info('try to get command characteristic');
                    document.querySelector('.console').textContent = 'control service retrieve'; 
                    return service.getCharacteristic(commandCharacteristic)
                })
                .then((characteristic) => { 
                    console.info('Get command characteristic');
                    console.info('try to write enable gesture command');
                    document.querySelector('.console').textContent += '\n command characteristic retrieve'; 
                    return characteristic.writeValue(enableGesturesCommand)
                })
                .then(() => {
                    console.info('Try to get Gesture Service');
                    document.querySelector('.console').textContent = 'Try to get Gesture service'; 
                    return currentDevice.gatt.getPrimaryService(gestureService)
                })
                .then(service=>{
                    console.info('Get Gesture Service');
                    console.info('try to get Gesture characteristic');
                    document.querySelector('.console').textContent = 'Try to get Gesture characteristic';
                    return service.getCharacteristic(gestureCharacteristic)
                })
                .then((characteristic) => {
                    console.info('Get gesture caracteristic');
                    console.info('try to listen gestures !');
                	document.querySelector('.console').textContent += '\ncharacteristic retrieve';
                    characteristic.startNotifications();
                    characteristic.addEventListener('characteristicvaluechanged', (ev) => {
                        const gesture = parseMyoGesture(ev.target.value);
                        console.info('Gesture : ', gesture);
                        document.querySelector('.console').textContent = `Gesture : ${gesture.gesture}`;
                    })
                }).catch(function(error) {
                    console.error(error);
                    document.querySelector('.console').textContent = `Error ! `;
                });
        });
    }

    window.addEventListener('load', pageLoad);
})();
