function getDataSigned(uSignedData, type) {
  generateEvent(type, uSignedData);
}

function generateEvent(eventName, unsignedData) {
  console.log("Event Name : ", eventName)
  var signEvent = new CustomEvent(eventName, {
    detail: unsignedData,
    bubbles: true,
    cancelable: true
  });

  document.body.dispatchEvent(signEvent);
}



