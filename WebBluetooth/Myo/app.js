'use strict'

// Get from https://github.com/chromakode/bicyclejs-talk/blob/07479fe3acfd722c930229d62ecadfa7ad3cdce3/src/myo.js

const controlServiceUID =                  'd5060001-a904-deb9-4748-2c7f4a124842';
const myoInfoCharacteristicUID =           'd5060101-a904-deb9-4748-2c7f4a124842';
const firmwareVersionCharacteristicUID =   'd5060201-a904-deb9-4748-2c7f4a124842';
const commandCharacteristicUID =           'd5060401-a904-deb9-4748-2c7f4a124842';

const gestureServiceUID =                  'd5060003-a904-deb9-4748-2c7f4a124842';
const gestureCharacteristicUID =           'd5060103-a904-deb9-4748-2c7f4a124842';

const ImuDataServiceUID =                  'd5060002-a904-deb9-4748-2c7f4a124842';
const IMUDataCharacteristicUID =           'd5060402-a904-deb9-4748-2c7f4a124842';
const MotionEventCharacteristicUID =       'd5060502-a904-deb9-4748-2c7f4a124842';

const EmgDataServiceUID =                  'd5060005-a904-deb9-4748-2c7f4a124842';
const EmgData0CharacteristicUID =          'd5060105-a904-deb9-4748-2c7f4a124842';
const EmgData1CharacteristicUID =          'd5060205-a904-deb9-4748-2c7f4a124842';
const EmgData2CharacteristicUID =          'd5060305-a904-deb9-4748-2c7f4a124842';
const EmgData3CharacteristicUID =          'd5060405-a904-deb9-4748-2c7f4a124842';

const enableGesturesCommand = new Uint8Array(5);
enableGesturesCommand[0] = 0x01; // set mode
enableGesturesCommand[1] = 0x03; // bytes in payload
enableGesturesCommand[2] = 0x00; // emg mode: none
enableGesturesCommand[3] = 0x00; // imu mode: disabled
enableGesturesCommand[4] = 0x01; // classifier mode: enabled

const disableGesturesCommand = Uint8Array.from(enableGesturesCommand);
disableGesturesCommand[4] = 0x00; // classifier mode: disabled

const enableAllCommand = Uint8Array.from(enableGesturesCommand);
enableAllCommand[2] = 0x01;
enableAllCommand[3] = 0x01;
enableAllCommand[4] = 0x01;

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
        services: [controlServiceUID,gestureServiceUID,ImuDataServiceUID,EmgDataServiceUID],
    }],
    optionalServices: [controlServiceUID,gestureServiceUID,ImuDataServiceUID,EmgDataServiceUID]
};

const emgModes = {
    NONE : 0x00,
    EMG_FILTER : 0x02,
    EMG_RAW : 0x03
};

const imuModes = {
    NONE : 0x00,
    DATA : 0x01,
    EVENTS : 0x02,
    ALL : 0x03,
    RAW : 0x04
};

const classifierModes = {
    NONE : 0x00,
    ON : 0x01
};

function generateCommand(emgMode, imuMode, classifierMode){
    const setCommand = new Uint8Array(5);
    setCommand[0] = 0x01; // set mode
    setCommand[1] = 0x03; // bytes in payload
    setCommand[2] = emgMode; // emg mode
    setCommand[3] = imuMode; // imu mode
    setCommand[4] = classifierMode; // classifier mode
    return setCommand;
}

(function() {

    let device = null;
    let gattServer = null;

    let controlService = null;
    let myoInfoCharacteristic = null;
    let firmwareVersionCharacteristic = null;
    let commandCharacteristic = null;

    let gestureService = null;
    let gestureCharacteristic = null;

    let ImuDataService = null;
    let IMUDataCharacteristic = null;
    let MotionEventCharacteristic = null;

    let EmgDataService = null;
    let EmgData0Characteristic = null;
    let EmgData1Characteristic = null;
    let EmgData2Characteristic = null;
    let EmgData3Characteristic = null;

    function parseMyoGesture(value) {
        console.log('ParseMyoGesture');
        switch(value.getUint8(0)){
            case 0x01: // arm_sync
                console.log('arm_sync');
                break;
            case 0x02: // arm_unsync
                console.log('arm_unsync');
                break;
            case 0x03: // pose
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
            case 0x04: // unlock
                console.log('unlock');
                break;
            case 0x05: // locked
                console.log('locked');
                break;
            case 0x06: // sync_failed
                console.log('sync_failed');
                break;
            case 0x07: // warmup
                console.log('warmup');
                break;
            default:
                console.log('Nothing !');
        }


        return { gesture: null }
    }

    function pageLoad() {

        document.getElementById('getInfos').style.display = 'none';
        document.getElementById('btnCommands').style.display = 'none';

         document.getElementById('allAsync').addEventListener('click', initMyo);

        document.getElementById('enableGestureCommand').addEventListener('click', async () =>{
            try{
                console.info('try to write enable gesture command');
                document.querySelector('.console').textContent = 'Try to write enable gesture command';
                await commandCharacteristic.writeValue(enableGesturesCommand);
                console.info('command send !');
                document.querySelector('.console').textContent += '\n Command send';
            }catch(e){
                console.error(e);
                document.querySelector('.console').textContent = `Error ! `;
            }
        });

        document.getElementById('disableGestureCommand').addEventListener('click', async () =>{
            try{
                console.info('try to write disable gesture command');
                document.querySelector('.console').textContent = 'Try to write disable gesture command';
                await commandCharacteristic.writeValue(disableGesturesCommand);
                console.info('command send !');
                document.querySelector('.console').textContent += '\n Command send';
            }catch(e){
                console.error(e);
                document.querySelector('.console').textContent = `Error ! `;
            }
        });

        document.getElementById('getInfos').addEventListener('click', readMyoInfos);
        document.getElementById('readGestureCharacteristic').addEventListener('click', subscribeClassifierNotifications);
        document.getElementById('enableAll').addEventListener('click', enableAllCommands);
    }

    async function initMyo(){
        try{
            device = await navigator.bluetooth.requestDevice(shape);

            console.info('Get Device, ', device);
            console.info('Try to connecting');
            document.querySelector('.console').textContent = 'connecting...';
            gattServer = await device.gatt.connect();
            console.info('Connect to myo device');

            controlService =  await gattServer.getPrimaryService(controlServiceUID)
            console.info('Get Control Service');
            document.querySelector('.console').textContent = 'control service retrieve';


            // Instructions to set commands
            console.info('try to get command characteristic');
            commandCharacteristic = await controlService.getCharacteristic(commandCharacteristicUID)
            console.info('Get command characteristic');
            document.querySelector('.console').textContent += '\n command characteristic retrieve';

            //send init commands :
            await commandCharacteristic.writeValue(generateCommand(emgModes.NONE, imuModes.DATA, classifierModes.ON));

            // Read Myo Informations
            document.querySelector('.console').textContent = 'Try to read myo infos';
            await readMyoInfos();

            await subscribeAll();

            // force a resync
            await commandCharacteristic.writeValue(generateCommand(emgModes.NONE, imuModes.DATA, classifierModes.NONE));
            await commandCharacteristic.writeValue(generateCommand(emgModes.NONE, imuModes.DATA, classifierModes.ON));

            document.getElementById('getInfos').style.display = '';
            document.getElementById('btnCommands').style.display = '';
        }catch(error){
            console.error(error);
            document.querySelector('.console').textContent = `Error ! `;
        }
    }

    async function enableAllCommands(){
        try{
            console.info('try to write enable all commands');
            document.querySelector('.console').textContent = 'Try to write enable all commands';
            await commandCharacteristic.writeValue(enableAllCommand);
            console.info('command send !');
            document.querySelector('.console').textContent += '\n Command send';
        }catch(e){
            console.error(e);
            document.querySelector('.console').textContent = `Error ! `;
        }
    }

    async function subscribeAll(){
        await subscribeIMUNotifications();
        await subscribeEMGNotifications();
        await subscribeClassifierNotifications();
    }

    async function subscribeIMUNotifications(){
        if (!ImuDataService){
            ImuDataService = await gattServer.getPrimaryService(ImuDataServiceUID);
        }
        console.info('Get IMU Service');
        console.info('Try to get IMU Characteristic');
        document.querySelector('.console').textContent += '\nTry to get Gesture characteristic';
        IMUDataCharacteristic = await ImuDataService.getCharacteristic(IMUDataCharacteristicUID);
        document.querySelector('.console').textContent += '\n characteristic retrieve';
        console.info('Get IMU characteristic');
        console.info('try to listen imu !');
        await IMUDataCharacteristic.startNotifications();
        console.info('Notifications starts !');
        document.querySelector('.console').textContent += '\n Notifications starts ! ';
        IMUDataCharacteristic.addEventListener('characteristicvaluechanged', handleIMUDataChanged);

    }

    async function subscribeEMGNotifications(){
        if (!EmgDataService){
            EmgDataService = await gattServer.getPrimaryService(EmgDataServiceUID);
        }
        console.info('Get Emg Service');
        console.info('Try to get Emg Characteristic');
        document.querySelector('.console').textContent += '\nTry to get Emg characteristic';
        EmgData0Characteristic = await EmgDataService.getCharacteristic(EmgData0CharacteristicUID);
        document.querySelector('.console').textContent += '\n characteristic retrieve';
        console.info('Get Emg characteristic');
        console.info('try to listen Emg !');
        await EmgData0Characteristic.startNotifications();
        console.info('Notifications starts !');
        document.querySelector('.console').textContent += '\n Notifications starts ! ';
        EmgData0Characteristic.addEventListener('characteristicvaluechanged', handleEMGDataChanged);
    }

    async function subscribeClassifierNotifications(){
        if (! gestureService){
            gestureService= await gattServer.getPrimaryService(gestureServiceUID)
        }
        console.info('Get Gesture Service');
        console.info('try to get Gesture characteristic');
        document.querySelector('.console').textContent += '\nTry to get Gesture characteristic';
        gestureCharacteristic = await gestureService.getCharacteristic(gestureCharacteristicUID)
        document.querySelector('.console').textContent += '\n characteristic retrieve';
        console.info('Get gesture caracteristic');
        //console.info('try to read value classifier');
        //parseMyoGesture(await gestureCharacteristic.readValue());
        console.info('try to listen gestures !');
        await gestureCharacteristic.startNotifications();
        console.info('Notifications starts !');
        document.querySelector('.console').textContent += '\n Notifications starts ! ';
        gestureCharacteristic.addEventListener('characteristicvaluechanged', (ev) => {
            const gesture = parseMyoGesture(ev.target.value);
            console.info('Gesture : ', gesture);
            document.querySelector('.console').textContent = `Gesture : ${gesture.gesture}`;
        });
    }

    async function readMyoInfos(){


        // General informations about Myo
        console.info('try to get myo Info characteristic');
        myoInfoCharacteristic = await controlService.getCharacteristic(myoInfoCharacteristicUID);
        console.info('Get info characteristic');
        console.info('try to get myo info values');
        const valueMyoInfo = await myoInfoCharacteristic.readValue();
        console.info('Get info characteristic values !');
        showMyoInfos(valueMyoInfo);
        console.info('try to get myo firmware');
        firmwareVersionCharacteristic = await controlService.getCharacteristic(firmwareVersionCharacteristicUID);
        console.info('Get Firmware version characteristic');
        console.info('try to get myo firmware value');
        const valueMyoFirmWare = await firmwareVersionCharacteristic.readValue();
        console.info('Get firmware characteristic values !');
        showFirmwareVersion(valueMyoFirmWare);

    }

    function showFirmwareVersion(value){
        try{
            const major = value.getUint16(0);
            const minor = value.getUint16(2);
            const patch = value.getUint16(4);
            const hardwareRev = value.getUint16(6);

            const hardwareRevisionStr = hardwareRev === 0 ? 'Unkown' : hardwareRev === 1 ? 'alpha(rev-c)' : hardwareRev === 2 ? 'rev-d' : hardwareRev;

            console.info(`Myo firmware version : ${major}.${minor}.${patch} / ${hardwareRevisionStr}`);
            document.querySelector('.console').textContent += `\n
            Myo Firmware version : ${major}.${minor}.${patch} / ${hardwareRevisionStr}`;
            document.querySelector('.console').textContent += `\n
            Myo Firmware version : ${+major.toString(16) / 100}.${+minor.toString(16) / 100}.${patch.toString(16)} / ${hardwareRevisionStr.toString(16)}`;
        }catch(e){
            console.error(e);
        }
    }

    function showMyoInfos(value){
        try{
            let serialNumber0 = value.getUint8(0);
            let serialNumber1 = value.getUint8(1);
            let serialNumber2 = value.getUint8(2);
            let serialNumber3 = value.getUint8(3);
            let serialNumber4 = value.getUint8(4);
            let serialNumber5 = value.getUint8(5);
            let unlockPose = value.getUint16(6);
            let activeClassifierType = value.getUint8(8);
            let activeClassifierIndex = value.getUint8(9);
            let hasCustomClassifier = value.getUint8(10);
            let streamIndicating = value.getUint8(11);
            let sku = value.getUint8(12);

            document.querySelector('.console').textContent += `
             Myo Informations :`;
            console.log('serialNumber', serialNumber0.toString(16), serialNumber1.toString(16), serialNumber2.toString(16), serialNumber3.toString(16), serialNumber4.toString(16), serialNumber5.toString(8));
            document.querySelector('.console').textContent += `
             -> Serial Number : ${serialNumber5.toString(16)}:${serialNumber4.toString(16)}:${serialNumber3.toString(16)}:${serialNumber2.toString(16)}:${serialNumber1.toString(16)}:${serialNumber0.toString(16)}`;
            console.log('unlockPose', unlockPose);
            document.querySelector('.console').textContent += `
             -> unlockPose : ${unlockPose}`;
            const activeClassifierTypeStr = `${activeClassifierType}, ${activeClassifierType === 0 ? 'classifier Package' : 'user data'}`;
            console.log('activeClassifierType', activeClassifierTypeStr);
            document.querySelector('.console').textContent += `
             -> activClassifierType : ${activeClassifierTypeStr}`;
            console.log('activeClassifierIndex', activeClassifierIndex);
            document.querySelector('.console').textContent += `
             -> activClassifierIndex : ${activeClassifierIndex}`;
            const hasCustomClassifierStr = `${hasCustomClassifier}, ${hasCustomClassifier === 1 ? 'Valid custom classifier' : 'no valid custom classifier'}`;
            console.log('hasCustomClassifier', hasCustomClassifierStr);
            document.querySelector('.console').textContent += `
             -> hasCustomClassifier : ${hasCustomClassifierStr}`;
            console.log('streamIndicating', streamIndicating);
            document.querySelector('.console').textContent += `
             -> streamIndicating : ${streamIndicating}`;
            const skuStr = `${sku}, ${sku === 0 ? 'Unkown Myo' : sku === 1 ? 'Black Myo' : 'White Myo'}`
            console.log('sku', skuStr);
            document.querySelector('.console').textContent += `
             -> sku : ${skuStr}`;

        }catch(e){
            console.error(e);
        }
    }

    function handleIMUDataChanged(event) {
        //byteLength of ImuData DataView object is 20.
        // imuData return {{orientation: {w: *, x: *, y: *, z: *}, accelerometer: Array, gyroscope: Array}}
        let imuData = event.target.value;

        let orientationW = event.target.value.getInt16(0) / 16384;
        let orientationX = event.target.value.getInt16(2) / 16384;
        let orientationY = event.target.value.getInt16(4) / 16384;
        let orientationZ = event.target.value.getInt16(6) / 16384;

        let accelerometerX = event.target.value.getInt16(8) / 2048;
        let accelerometerY = event.target.value.getInt16(10) / 2048;
        let accelerometerZ = event.target.value.getInt16(12) / 2048;

        let gyroscopeX = event.target.value.getInt16(14) / 16;
        let gyroscopeY = event.target.value.getInt16(16) / 16;
        let gyroscopeZ = event.target.value.getInt16(18) / 16;

        const data = {
          orientation: {
            x: orientationX,
            y: orientationY,
            z: orientationZ,
            w: orientationW
          },
          accelerometer: {
            x: accelerometerX,
            y: accelerometerY,
            z: accelerometerZ
          },
          gyroscope: {
            x: gyroscopeX,
            y: gyroscopeY,
            z: gyroscopeZ
          }
        }

        const state = {
          orientation: data.orientation,
          accelerometer: data.accelerometer,
          gyroscope: data.gyroscope
        }

        console.log(state);
      }

    function handleEMGDataChanged(event){
        //byteLength of ImuData DataView object is 20.
        // imuData return {{orientation: {w: *, x: *, y: *, z: *}, accelerometer: Array, gyroscope: Array}}
        let emgData = event.target.value;

        let sample1 = [
          emgData.getInt8(0),
          emgData.getInt8(1),
          emgData.getInt8(2),
          emgData.getInt8(3),
          emgData.getInt8(4),
          emgData.getInt8(5),
          emgData.getInt8(6),
          emgData.getInt8(7)
        ]

        let sample2 = [
          emgData.getInt8(8),
          emgData.getInt8(9),
          emgData.getInt8(10),
          emgData.getInt8(11),
          emgData.getInt8(12),
          emgData.getInt8(13),
          emgData.getInt8(14),
          emgData.getInt8(15)
        ]

        const state = {
            emgData : sample1
        };

        console.log(state);
    }

    window.addEventListener('load', pageLoad);
})();
