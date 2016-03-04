'use strict'

var serviceUUID = '11111111-2222-3333-4444-000000000000',
	characteristicWriteUUID = '11111111-2222-3333-4444-000000000010',
	deviceName = "MyDevice",
	encoder = new TextEncoder();

deviceName = "Makeblock_LE";
serviceUUID = "0000ffe1-0000-1000-8000-00805f9b34fb";
characteristicWriteUUID = "0000ffe3-0000-1000-8000-00805f9b34fb";

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

function str2ab(str) {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i=0, strLen=str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

var serverGATT = null,
	serviceGATT = null;

function initBle(){
	return new Promise(function(resolve, reject){
		navigator.bluetooth.requestDevice({ 
			filters: [{ name: deviceName }]
		})
		.then(function(device) {
		   document.querySelector('#output').textContent = 'connecting...';
		   return device.connectGATT();
		 })
		.then(function(server) {
			serverGATT = server;
			//return server.getPrimaryService(serviceUUID);
		   // FIXME: Remove this timeout when GattServices property works as intended.
		   // crbug.com/560277
		   return new Promise(function(resolveService, rejectService) {
		     setTimeout(function() {
		     	try{
		       		resolveService(server.getPrimaryService(serviceUUID));
		     	}catch(err){
		     		rejectService(err);
		     	}
		     }, 2e3);
		   })
		}).then(function(service){
			serviceGATT = service;
			resolve(service);			
		}).catch(function(error){
			console.error(error);
			reject(error);
		});
	})
}

function pageLoad(){
	document.getElementById('clickMe').addEventListener('click', function(){
		//completeWriteOperation();
		processCharacteristic(true);
	});

	document.getElementById('clickMeInfo').addEventListener('click', function(){
		processCharacteristic(false);
	});


	document.getElementById('m11').addEventListener('click', function(){
		//completeWriteOperation();
		processCharacteristic(true,1,1);
	});
	document.getElementById('m12').addEventListener('click', function(){
		//completeWriteOperation();
		processCharacteristic(true,1,2);
	});
	document.getElementById('m13').addEventListener('click', function(){
		//completeWriteOperation();
		processCharacteristic(true,1,3);
	});
	document.getElementById('m21').addEventListener('click', function(){
		//completeWriteOperation();
		processCharacteristic(true,2,1);
	});
	document.getElementById('m22').addEventListener('click', function(){
		//completeWriteOperation();
		processCharacteristic(true,2,2);
	});
	document.getElementById('m23').addEventListener('click', function(){
		//completeWriteOperation();
		processCharacteristic(true,2,3);
	});

}

function getService(){
	return new Promise(function(resolve, reject){
		if (serverGATT && serverGATT.connected){
			resolve(serviceGATT);
		}else{
			initBle()
			.then(function(service){
				resolve(service);
			})
			.catch(function(error){
				reject(error);
			});
		}
	});
}

function getMotorInfo(indexMotor, indexInstruction){
	// Motor M1
	//"ff:55:09:00:02:0a:09:64:00:00:00:00:0a" 
	//"ff:55:09:00:02:0a:09:00:00:00:00:00:0a"
	// ff:55:09:00:02:0a:09:9c:ff:00:00:00:0a
	// Motor M2
	// ff:55:09:00:02:0a:0a:64:00:00:00:00:0a
	// ff:55:09:00:02:0a:0a:00:00:00:00:00:0a
	// ff:55:09:00:02:0a:0a:9c:ff:00:00:00:0a
	var buf = new ArrayBuffer(16);
	var bufView = new Uint16Array(buf);
	bufView[0] = 0x55ff;
	bufView[1] = 0x0009;
	bufView[2] = 0x0a02;
	if (indexMotor === 1){
		if (indexInstruction === 1){
			bufView[3] = 0x6409;
			bufView[4] = 0x0000;
		}else if (indexInstruction === 2){
			bufView[3] = 0x0009;
			bufView[4] = 0x0000;
		}else{
			bufView[3] = 0x9c09;
			bufView[4] = 0x00ff;
		}
	}else{
			
		if (indexInstruction === 1){
			bufView[3] = 0x640a;	
			bufView[4] = 0x0000;
		}else if (indexInstruction === 2){
			bufView[3] = 0x000a;	
			bufView[4] = 0x0000;
		}else{
			bufView[3] = 0x9c0a;	
			bufView[4] = 0x00ff;
		}
	}
	bufView[5] = 0x0000;
	bufView[6] = 0x000a;
	bufView[7] = 0x0000;

	return buf;
}

function processCharacteristic(write, motor, instruction){
	getService()
	.then(function(service){
		console.log("Try to get Characteritic : %O",service);
		return service.getCharacteristic(characteristicWriteUUID);
	}).then(function(characteristic){
		if (write){			
			if (!motor && !instruction){
			console.log("Try to write value : %O",characteristic);
			var writeValue = str2ab("test");
			write= encoder.encode("ff:55:09:00:02:08:06:00:5c:99:6d:00:0a");
			write= encoder.encode("ff550900020806005c996d000a");
			//write = str2ab("ff550900020806005c996d000a");
			var buf = new ArrayBuffer(14);
			var bufView = new Uint16Array(buf);
			bufView[0] = 0xff;
			bufView[1] = 0x55;
			bufView[2] = 0x09;
			bufView[3] = 0x00;
			bufView[4] = 0x02;
			bufView[5] = 0x08;
			bufView[6] = 0x06;
			bufView[7] = 0x00;
			bufView[8] = 0x5c;
			bufView[9] = 0x99;
			bufView[10] = 0x6d;
			bufView[11] = 0x00;
			bufView[12] = 0x0a;
			bufView[13] = 0x00;

			// Led
			buf = new ArrayBuffer(16);
			bufView = new Uint16Array(buf);
			bufView[0] = 0x55ff;
			bufView[1] = 0x0009;
			bufView[2] = 0x0802;
			bufView[3] = 0x0006;
			bufView[4] = 0x995c;
			bufView[5] = 0x006d;
			bufView[6] = 0x000a;
			bufView[7] = 0x0000;
			write = buf;

			// Motor M1
			//"ff:55:09:00:02:0a:09:64:00:00:00:00:0a" 
			//"ff:55:09:00:02:0a:09:00:00:00:00:00:0a"
			// ff:55:09:00:02:0a:09:9c:ff:00:00:00:0a
			// Motor M2
			// ff:55:09:00:02:0a:0a:64:00:00:00:00:0a
			// ff:55:09:00:02:0a:0a:00:00:00:00:00:0a
			// ff:55:09:00:02:0a:0a:9c:ff:00:00:00:0a
			buf = new ArrayBuffer(16);
			bufView = new Uint16Array(buf);
			bufView[0] = 0x55ff;
			bufView[1] = 0x0009;
			bufView[2] = 0x0a02;
			bufView[3] = 0x090a;
			bufView[4] = 0x00ff;
			bufView[5] = 0x0000;
			bufView[6] = 0x000a;
			bufView[7] = 0x0000;
			write = buf;
			return characteristic.writeValue(write);
			}else{
				return characteristic.writeValue(getMotorInfo(motor, instruction));
			}
		}else{
			return characteristic.readValue();
		}
	}).then(function(buffer){
		if (write){
			document.querySelector('#output').textContent = 'Write Datas ! ';
			console.info("Write datas ! ");
		}else{
			let data = new DataView(buffer);
		    let dataDecrypt = data.getUint8(0);
		    document.querySelector('#output').textContent = `Receive Datas ${dataDecrypt}`;
		    console.log('ReceiveDatas %s', dataDecrypt);
		}
	}).catch(function(error){
		console.error(error);
		document.querySelector('#output').textContent = `Error :  ${error}`;
	});
}

window.addEventListener('load', pageLoad);