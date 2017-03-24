'use strict'

var presentationUrl = 'https://google.com/cast/#__castAppId__=EF1A139F';
var presentationRequest;
var presentationConnection;


function pageLoad() {
  document.querySelector('#createRequest').addEventListener('click', function () {
    presentationRequest = new PresentationRequest(presentationUrl);
    document.querySelector('#createRequest').disabled = true;
    document.querySelector('#start').disabled = false;
    document.querySelector('#reconnect').disabled = false;
    presentationRequest.getAvailability().then(function (availability) {
      updatePresentationAvailability(availability.value);
      availability.onchange = function () {
        updatePresentationAvailability(availability.value);
      };
    });

    document.querySelector('#start').addEventListener('click', function () {
      presentationRequest.start().then(function (connection) {
        superLog('Connected to presentation: ' + connection.id);
        setConnection(connection);
      }).catch(function (error) {
        superLog(error.name + ': ' + error.message);
      });
    });

    document.querySelector('#reconnect').addEventListener('click', function () {
      var presentationId = document.querySelector('#presentationId').value.trim();
      if (presentationId.length) {
        presentationRequest.reconnect(presentationId).then(function (connection) {
          superLog('Reconnected to presentation: ' + connection.id);
          setConnection(connection);
        }).catch(function (error) {
          superLog(error.name + ': ' + error.message);
        });
      }
    });

    document.querySelector('#close').addEventListener('click', function () {
      if (presentationConnection) {
        presentationConnection.close();
        document.querySelector('#close').disabled = true;
        document.querySelector('#terminate').disabled = true;
      }
    });

    document.querySelector('#terminate').addEventListener('click', function () {
      if (presentationConnection) {
        presentationConnection.terminate();
        document.querySelector('#close').disabled = true;
        document.querySelector('#terminate').disabled = true;
      }
    });
  });

}

function updatePresentationAvailability(displaysAvailable) {
  superLog('Presentation displays are ' +
    (displaysAvailable ? 'available' : 'unavailable') + '.');
}



function setConnection(connection) {
  presentationConnection = connection;
  document.querySelector('#close').disabled = false;
  document.querySelector('#terminate').disabled = false;
  presentationConnection.onclose = function () {
    superLog('Connection closed.');
  };
  presentationConnection.onterminate = function () {
    superLog('Connection terminated.');
  };
}

function superLog(msg){
  document.getElementById('output').innerHTML = msg;
}




window.addEventListener('load', pageLoad);