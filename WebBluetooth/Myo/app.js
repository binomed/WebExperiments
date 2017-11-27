'use strict'

// Get from https://github.com/chromakode/bicyclejs-talk/blob/07479fe3acfd722c930229d62ecadfa7ad3cdce3/src/myo.js

const controlService =                  'd5060001-a904-deb9-4748-2c7f4a124842';
const gestureService =                  'd5060003-a904-deb9-4748-2c7f4a124842';
const myoInfoCharacteristic =           'd5060101-a904-deb9-4748-2c7f4a124842';
const FirmwareVersionCharacteristic =   'd5060201-a904-deb9-4748-2c7f4a124842';
const commandCharacteristic =           'd5060401-a904-deb9-4748-2c7f4a124842';
const gestureCharacteristic =           'd5060103-a904-deb9-4748-2c7f4a124842';

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

const vibrateCommand = new Uint8Array(3);
vibrateCommand[0] = 0x03; // set mode
vibrateCommand[1] = 0x01; // bytes in payload
vibrateCommand[2] = 0x00; //none vibration

const vibrateShortCommand = Uint8Array.from(vibrateCommand);
vibrateShortCommand[2] = 0x01; //short vibration

const vibrateMediumCommand = Uint8Array.from(vibrateCommand);
vibrateMediumCommand[2] = 0x02; // medium vibration

const vibrateLongCommand = Uint8Array.from(vibrateCommand);
vibrateLongCommand[2] = 0x03; // long vibration

const sleepCommand = new Uint8Array(3);
sleepCommand[0] = 0x09; // set mode
sleepCommand[1] = 0x01; // bytes in payload
sleepCommand[2] = 0x00; // normal sleep

const neverSleepCommand = Uint8Array.from(sleepCommand);
neverSleepCommand[2] = 0x01; // never go to sleep

const unlockCommand = new Uint8Array(3);
unlockCommand[0] = 0x0a; //set mode
unlockCommand[1] = 0x01; //bytes in payload
unlockCommand[2] = 0x00; // Re-lock immediatly

const unlockTimedCommand = Uint8Array.from(unlockCommand);
unlockTimedCommand[2] = 0x01; // Unlock now and re-lock after a fixed timeout.

const unlockHoldCommand = Uint8Array.from(unlockCommand);
unlockHoldCommand[2] = 0x02; //  Unlock now and remain unlocked until a lock command is received.

const userActionCommand = new Uint8Array(3);
userActionCommand[0] = 0x0b; // set mode
userActionCommand[1] = 0x01; // bytes in payload
userActionCommand[2] = 0x00; // User did a single, discrete action, such as pausing a video.

const shape = {
    filters: [
        {name: 'JefMyo'},{
        services: [controlService],
    }],
    optionalServices: [gestureService]
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
        document.getElementById('allAsync').addEventListener('click', async ()=>{
            try{
                const device = await navigator.bluetooth.requestDevice(shape);

                console.info('Get Device, ', device);
                console.info('Try to connecting');
                document.querySelector('.console').textContent = 'connecting...';
                const server = await device.gatt.connect();
                    console.info('Connect to myo device');
                    console.info('Try to get Control Service');
                    document.querySelector('.console').textContent = 'Try to get Control service';
                const realControlService = await server.getPrimaryService(controlService)
                    console.info('Get Control Service');
                    console.info('try to get command characteristic');
                    document.querySelector('.console').textContent = 'control service retrieve';
                const realCommandChar = await realControlService.getCharacteristic(commandCharacteristic)
                    console.info('Get command characteristic');
                    console.info('try to get myo Info characteristic');
                const realMyoInfoChar = await realControlService.getCharacteristic(myoInfoCharacteristic);
                    console.info('Get info characteristic');
                    document.querySelector('.console').textContent += '\n command characteristic retrieve';
                    console.info('try to get myo info values');
                const valueMyoInfo = await realMyoInfoChar.readValue();
                    console.info('Get info characteristic values !');
                    showMyoInfos(valueMyoInfo);
                    console.info('try to write enable gesture command');
                await realCommandChar.writeValue(enableGesturesCommand)
                    console.info('Try to get Gesture Service');
                    document.querySelector('.console').textContent = 'Try to get Gesture service';
                const realGestureService = await server.getPrimaryService(gestureService)
                    console.info('Get Gesture Service');
                    console.info('try to get Gesture characteristic');
                    document.querySelector('.console').textContent = 'Try to get Gesture characteristic';
                const realGestureChar = await realGestureService.getCharacteristic(gestureCharacteristic)
                    console.info('Get gesture caracteristic');
                    console.info('try to listen gestures !');
                    document.querySelector('.console').textContent += '\n characteristic retrieve';
                    await realGestureChar.startNotifications();
                    console.info('Notifications starts !');
                    document.querySelector('.console').textContent += '\n Notifications starts ! ';
                realGestureChar.addEventListener('characteristicvaluechanged', (ev) => {
                        const gesture = parseMyoGesture(ev.target.value);
                        console.info('Gesture : ', gesture);
                        document.querySelector('.console').textContent = `Gesture : ${gesture.gesture}`;
                    })
            }catch(error){
                console.error(error);
                document.querySelector('.console').textContent = `Error ! `;
            }

        });
    }

    function showMyoInfos(value){
        console.log(value);
        console.log(value.buffer);
        console.log(String.fromCharCode.apply(null, new Uint16Array(value)));
        console.log(String.fromCharCode.apply(null, new Uint8Array(value)));
        console.log(String.fromCharCode.apply(null, new Uint16Array(value.buffer)));
        console.log(String.fromCharCode.apply(null, new Uint8Array(value.buffer)));
        try{
            let serialNumber = value.getInt8(0);
            let unlockPose = value.getInt16(1);
            let activeClassifierType = value.getInt8(3);
            let activeClassifierIndex = value.getInt8(4);
            let hasCustomClassifier = value.getInt8(5);
            let streamIndicating = value.getInt8(6);
            let sku = value.getInt8(7);

            console.log('serialNumber', serialNumber);
            console.log('unlockPose', unlockPose);
            console.log('activeClassifierType', activeClassifierType, activeClassifierType === 0 ? 'classifier Package' : 'user data');
            console.log('activeClassifierIndex', activeClassifierIndex);
            console.log('hasCustomClassifier', hasCustomClassifier, hasCustomClassifier === 1 ? 'Valid custom classifier' : 'no valid custom classifier');
            console.log('streamIndicating', streamIndicating);
            console.log('sku', sku, sku === 0 ? 'Unkown Myo' : sku === 1 ? 'Black Myo' : 'White Myo');

        }catch(e){
            console.error(e);
        }
    }

    window.addEventListener('load', pageLoad);
})();
