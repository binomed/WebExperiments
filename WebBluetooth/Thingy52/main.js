import {
    Thingy
} from './libs/thingy.js';

const thingy = new Thingy({
    logEnabled: true
});

/**
 *
 * @param {Thingy} device
 */
async function start(device) {
    try {
        await device.connect();
        await device.ledBreathe({
            color: 5,
            intensity: 20,
            delay: 1500
        });
        console.log(`Thingy name: ${await device.getName()}`);
        console.log(`Current firmware: ${await device.getFirmwareVersion()}`);
    } catch (error) {
        console.error(error);
    }
}

document.getElementById('clickMe').addEventListener('click', async () => {
    start(thingy)
});

//start(thingy);