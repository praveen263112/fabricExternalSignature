const proto = new fabricMsg.fabricProto("/javascripts/proto/proposal.proto");
document.addEventListener("fabricMessage.proposal", getProposalSigned, true);
document.addEventListener("fabricMessage.commitProposal", getCommitProposalSigned, true);

async function getProposalSigned(event) {
  console.log("ProposalSigned Reached")
  alert("Sign Proposal")
  let proposalMsg = event.detail;
  await sendData("fabricMessage.proposal", proposalMsg, "signProposal")

}
async function getCommitProposalSigned(event) {
  console.log("Event Reached Here")
  alert("Sign Commit Proposal")
  let commitMsg = event.detail
  await sendData("fabricMessage.commitProposal", commitMsg, "signCommitProposal")
}

async function sendData(protoDef, protoMsg, eventName) {
  await proto.setProtoDef(protoDef);
  let proposalMsgBuf = proto.encodeProtoMsg(protoMsg);
  var Data = {
    data: Array.apply(null, new Uint8Array(proposalMsgBuf)),
    contentType: 'application/octet-stream',
    type: eventName
  };
  let transportData = JSON.stringify(Data)
  chrome.runtime.sendMessage({ msg: eventName, data: transportData }, function (response) {
    console.log(response); //nothing get consoled out here.
  });
}



chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {

  console.log(request.msg)
  await proto.setProtoDef("fabricMessage.signedProposal");
  let msgObj = JSON.parse(request.data)
  let msgBuf = new Uint8Array(msgObj.data);
  console.log("msgBuf : ", msgBuf)
  let signedMsgBuf = proto.decodeMsgBuffer(msgBuf)
  console.log(signedMsgBuf)
  generateEvent(request.msg, signedMsgBuf)
});

function generateEvent(eventName, data = null) {
  console.log("event data received : ", data);
  var signEvent = new CustomEvent(eventName, {
    detail: data,
    bubbles: true,
    cancelable: true
  });
  document.body.dispatchEvent(signEvent);
}
