'use strict'
function pageLoad(){
	document.getElementById('nfcRead').addEventListener('click', function(){
		processNfc();
	});

  document.getElementById('nfcPush').addEventListener('click', function(){
    pushNfc();
  });
	
}

function pushNfc(){
  navigator.nfc.push({
    data: [{ recordType: "url", data: "https://jef.binomed.fr" }]
  }).then(() => {
    console.log("Message pushed.");
  }).catch((error) => {
    console.log("Push failed :-( try again.");
  });
}

function processMessage(message) {
  for (let record of message.data) {
    switch (record.recordType) {
      case "text":
        console.log('Data is text: ' + record.data);
        break;
      case "url":
        console.log('Data is URL: ' + record.data);
        break;
      case "json":
        console.log('JSON data: ' + record.data.myProperty.toString());
        break;
      case "opaque":
        if (record.mediaType == 'image/png') {
          var img = document.createElement("img");
          img.src = URL.createObjectURL(new Blob(record.data, record.mediaType));
          img.onload = function() {
            window.URL.revokeObjectURL(this.src);
          };
        }
        break;
    }
  }
}

function processNfc(){
	navigator.nfc.watch((message) => {
		if (message.data[0].recordType == 'empty') {
			navigator.nfc.push({
			  url: "/custom/path",
			  data: [{ recordType: "text", data: 'Hello World' }]
			});
		} else {
			console.log('Read message written by ' + message.url);
			processMessage(message);
		}
	}).then(() => {
		console.log("Added a watch.");
	}).catch((error) => {
		console.log("Adding watch failed: " + error.name);
	});

}

window.addEventListener('load', pageLoad);