'use strict'

var serviceUUID = '11111111-2222-3333-4444-000000000000',
	characteristicWriteUUID = '11111111-2222-3333-4444-000000000010',
	deviceName = "MyDevice",
	encoder = new TextEncoder();

var charArray = [];


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


function getCharacteristic(){
	return new Promise(function(resolve, reject){
		getService()
		.then(service =>{
			return service.getCharacteristic(characteristicWriteUUID);
		})
		.then(characteristic =>{
			charArray[characteristicWriteUUID] = characteristic
			resolve(characteristic);
		}).catch(error =>{
			reject(eror);
		});	
	});
	
}



function processCharacteristic(write, value){	
	getCharacteristic().then(function(characteristic){
		if (write){			
			if (Array.isArray(value)){
				value.for
			}	
			return characteristic.writeValue(encoder.encode('test'));
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