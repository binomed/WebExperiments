'use strict'

const serviceUUID = '11111111-2222-3333-4444-000000000000',
	characteristicWriteUUID = '11111111-2222-3333-4444-000000000010';

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
			filters: [{ name: 'MyDevice' }]
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

}

function completeWriteOperation(){
	navigator.bluetooth.requestDevice({ 
		filters: [{ name: 'MyDevice' }]
	})
	.then(function(device) {
	   document.querySelector('#output').textContent = 'connecting...';
	   return device.connectGATT();
	 })
	.then(function(server) {
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
		console.log("Try to get Characteritic : %O",service);
		return service.getCharacteristic(characteristicWriteUUID);	
	}).then(function(characteristic){
		if (true){			
			console.log("Try to write value : %O",characteristic);
			return characteristic.writeValue(str2ab("test"));
		}else{
			return characteristic.readValue();
		}
	}).then(function(buffer){
		if (true){
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
		reject(error);
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

function processCharacteristic(write){
	getService()
	.then(function(service){
		console.log("Try to get Characteritic : %O",service);
		return service.getCharacteristic(characteristicWriteUUID);
	}).then(function(characteristic){
		if (write){			
			console.log("Try to write value : %O",characteristic);
			return characteristic.writeValue(str2ab("test"));
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