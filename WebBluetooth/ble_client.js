'use strict'

var serviceUUID = '11111111-2222-3333-4444-000000000000',
	characteristicWriteUUID = '11111111-2222-3333-4444-000000000010',
	deviceName = "MyDevice",
	encoder = new TextEncoder();

deviceName = "Makeblock_LE";
serviceUUID = "0000ffe1-0000-1000-8000-00805f9b34fb";
characteristicWriteUUID = "0000ffe3-0000-1000-8000-00805f9b34fb";

const TYPE_MOTOR = 0x0a,
	TYPE_RGB = 0x08,
	TYPE_SOUND = 0x07;

var picker;

function  updatePicker(pickerUpdate){
	picker = pickerUpdate;
}


const PORT_1 = 0x01,
	PORT_2 = 0x02,
	PORT_3 = 0x03,
	PORT_4 = 0x04,
	PORT_5 = 0x05,
	PORT_6 = 0x06,
	PORT_7 = 0x07,
	PORT_8 = 0x08,
	M_1 = 0x09,
	M_2 = 0x0a;

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
			filters: [{ name: deviceName }], optionalServices: [serviceUUID]
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

	document.getElementById('color').addEventListener('click', function(){
		var valueArray = [0,0,0];
		if (picker){
			valueArray[0] = picker.rgb[0];
			valueArray[1] = picker.rgb[1];
			valueArray[2] = picker.rgb[2];
		}
		var rHex = valueArray[0]<<8;
		var gHex = valueArray[1]<<16;
		var bHex = valueArray[2]<<24;
		var value = rHex | gHex | bHex;
		processCharacteristic(true, genericControl(TYPE_RGB,PORT_6,0,value));
	});


	document.getElementById('up').addEventListener('click', function(){
		//completeWriteOperation();
		processCharacteristic(true,genericControl(TYPE_MOTOR, M_1, 0, 100));
		processCharacteristic(true,genericControl(TYPE_MOTOR, M_2, 0, 100));
	});
	document.getElementById('down').addEventListener('click', function(){
		//completeWriteOperation();
		processCharacteristic(true,genericControl(TYPE_MOTOR, M_1, 0, -100));
		processCharacteristic(true,genericControl(TYPE_MOTOR, M_2, 0, -100));
	});
	document.getElementById('stop').addEventListener('click', function(){
		//completeWriteOperation();
		processCharacteristic(true,genericControl(TYPE_MOTOR, M_1, 0, 0));
		processCharacteristic(true,genericControl(TYPE_MOTOR, M_2, 0, 0));
	});
	document.getElementById('left').addEventListener('click', function(){
		//completeWriteOperation();
		processCharacteristic(true,genericControl(TYPE_MOTOR, M_1, 0, 100));
		processCharacteristic(true,genericControl(TYPE_MOTOR, M_2, 0, -100));
	});
	document.getElementById('right').addEventListener('click', function(){
		//completeWriteOperation();
		processCharacteristic(true,genericControl(TYPE_MOTOR, M_1, 0, -100));
		processCharacteristic(true,genericControl(TYPE_MOTOR, M_2, 0, 100));
	});
	/*document.getElementById('m23').addEventListener('click', function(){
		//completeWriteOperation();
		processCharacteristic(true,2,3);
	});*/

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

function genericControl(type, port, slot, value){
	/*
	ff 55 len idx action device port  slot  data a
	0  1  2   3   4      5      6     7     8
	*/
	//unsigned char a[11]={0xff,0x55,WRITEMODULE,7,0,0,0,0,0,0,'\n'};
    //a[4] = [type intValue];
    //a[5] = (port<<4 & 0xf0)|(slot & 0xf);
    // Static values
	var buf = new ArrayBuffer(16);
	var bufView = new Uint16Array(buf);
	
	var byte0 = 0xff,
		byte1 = 0x55,
		byte2 = 0x09,
		byte3 = 0x00,
		byte4 = 0x02,
		byte5 = type,
		byte6 = port,
		byte7 = slot;
	//dynamics values
	var byte8 = 0x00,
		byte9 = 0x00,
		byte10 = 0x00,
		byte11 = 0x00;
	//End of message
	var byte12 = 0x0a,
		byte13 = 0x00,
		byte14 = 0x00,
		byte15 = 0x00;

	switch(type){
		case TYPE_MOTOR:
			// Motor M1
			// ff:55  09:00  02:0a  09:64  00:00  00:00  0a"
			// 0x55ff;0x0009;0x0a02;0x0964;0x0000;0x0000;0x000a;0x0000;
			//"ff:55:09:00:02:0a:09:00:00:00:00:00:0a"
			// ff:55:09:00:02:0a:09:9c:ff:00:00:00:0a
			// Motor M2
			// ff:55:09:00:02:0a:0a:64:00:00:00:00:0a
			// ff:55:09:00:02:0a:0a:00:00:00:00:00:0a
			// ff:55:09:00:02:0a:0a:9c:ff:00:00:00:0a
			var tempValue = value < 0 ? (parseInt("ffff",16) + Math.max(-255,value)) : Math.min(255, value);
			byte7 = tempValue & 0x00ff;
			byte8 = 0x00;

			/*byte5 = 0x0a;
			byte6 = 0x09;
			byte7 = 0x64;
			byte8 = 0x00;*/
			
		break;
		case TYPE_RGB:
			// ff:55  09:00  02:08  06:00  5c:99  6d:00  0a
			// 0x55ff;0x0009;0x0802;0x0006;0x995c;0x006d;0x000a;0x0000;
			byte7 = 0x00;
			byte8 = value>>8 & 0xff;
			byte9 = value>>16 & 0xff;
			byte10 = value>>24 & 0xff;
		break;
		case TYPE_SOUND:
		break;
	}

	bufView[0] = byte1<<8 | byte0;
	bufView[1] = byte3<<8 | byte2;
	bufView[2] = byte5<<8 | byte4;
	bufView[3] = byte7<<8 | byte6;
	bufView[4] = byte9<<8 | byte8;
	bufView[5] = byte11<<8 | byte10;
	bufView[6] = byte13<<8 | byte12;
	bufView[7] = byte15<<8 | byte14;
	console.log(
			byte0.toString(16)+":"+
			byte1.toString(16)+":"+
			byte2.toString(16)+":"+
			byte3.toString(16)+":"+
			byte4.toString(16)+":"+
			byte5.toString(16)+":"+
			byte6.toString(16)+":"+
			byte7.toString(16)+":"+
			byte8.toString(16)+":"+
			byte9.toString(16)+":"+
			byte10.toString(16)+":"+
			byte11.toString(16)+":"+
			byte12.toString(16)+":"+
			byte13.toString(16)+":"+
			byte14.toString(16)+":"+
			byte15.toString(16)+":"
			);
	console.log(
			bufView[0].toString(16)+":"+
			bufView[1].toString(16)+":"+
			bufView[2].toString(16)+":"+
			bufView[3].toString(16)+":"+
			bufView[4].toString(16)+":"+
			bufView[5].toString(16)+":"+
			bufView[6].toString(16)+":"+
			bufView[7].toString(16)
			);
	return buf;
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

function processCharacteristic(write, value){
	getService()
	.then(function(service){
		console.log("Try to get Characteritic : %O",service);
		return service.getCharacteristic(characteristicWriteUUID);
	}).then(function(characteristic){
		if (write){			
			if (!value){
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

			console.log(
				bufView[0].toString(16)+":"+
				bufView[1].toString(16)+":"+
				bufView[2].toString(16)+":"+
				bufView[3].toString(16)+":"+
				bufView[4].toString(16)+":"+
				bufView[5].toString(16)+":"+
				bufView[6].toString(16)+":"+
				bufView[7].toString(16)
				);

			// Motor M1
			//"ff:55:09:00:02:0a:09:64:00:00:00:00:0a" 
			//"ff:55:09:00:02:0a:09:00:00:00:00:00:0a"
			// ff:55:09:00:02:0a:09:9c:ff:00:00:00:0a
			// Motor M2
			// ff:55:09:00:02:0a:0a:64:00:00:00:00:0a
			// ff:55:09:00:02:0a:0a:00:00:00:00:00:0a
			// ff:55:09:00:02:0a:0a:9c:ff:00:00:00:0a
			/*buf = new ArrayBuffer(16);
			bufView = new Uint16Array(buf);
			bufView[0] = 0x55ff;
			bufView[1] = 0x0009;
			bufView[2] = 0x0a02;
			bufView[3] = 0x090a;
			bufView[4] = 0x00ff;
			bufView[5] = 0x0000;
			bufView[6] = 0x000a;
			bufView[7] = 0x0000;*/
			//write = buf;
			return characteristic.writeValue(write);
			}else{
				return characteristic.writeValue(value);
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