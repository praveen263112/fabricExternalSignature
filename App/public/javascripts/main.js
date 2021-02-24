
const proto = new fabricMsg.fabricProto("/javascripts/proto/proposal.proto");

async function postData(endPoint, Body, contentType = "application/octet-stream") {
  return await fetch("/" + endPoint, {
    method: "POST",
    headers: {
      "Content-Type": contentType
    },
    body: Body
  })
}

async function getUintBuffer(data) {
  return new Uint8Array(await data.arrayBuffer())
}


async function handleProposal(ProposalDef, proposalData) {
  await proto.setProtoDef(ProposalDef);
  let UintMsg = await getUintBuffer(proposalData)
  let proposalMsg = proto.decodeMsgBuffer(UintMsg);
  console.log("proposalMsg : ", proposalMsg);
  getDataSigned(proposalMsg, ProposalDef);
}


async function ManWriteData() {
  event.preventDefault();
  let randomNumber = Math.random().toString();
  // const vin = document.getElementById('VinNumbMan').value;
  // const make = document.getElementById('carMake').value;
  // const model = document.getElementById('model').value;
  // const color = document.getElementById('color').value;
  // const dom = document.getElementById('dom').value;
  // const flag = document.getElementById('flag').value;
  const vin = randomNumber
  const make = randomNumber
  const model = randomNumber
  const color = randomNumber
  const dom = randomNumber
  const flag = randomNumber
  await proto.setProtoDef("fabricMessage.payload");
  let payloadMsg = proto.createProtoMsg({
    payload: [vin, make, model, color, dom, flag]
  });
  let payloadMsgBuf = proto.encodeProtoMsg(payloadMsg)
  let resp = await postData("getProposal", payloadMsgBuf)
  await handleProposal("fabricMessage.proposal", resp)

}
document.addEventListener(
  "signProposalData",
  async function (event) {
    console.log("here at document! signProposalData ")
    let protoMsg = event.detail
    await proto.setProtoDef("fabricMessage.signedProposal");
    let encodedMsg = proto.encodeProtoMsg(protoMsg)
    console.log("encodedMsg : ", encodedMsg)
    let resp = await postData("getCommitProposal", encodedMsg)
    await handleProposal("fabricMessage.commitProposal", resp)   // generateCommitProposal(signedData);
  },
  true
);

document.addEventListener(
  "signCommitProposalData",
  async function (event) {
    console.log("here at document ! signCommitProposalData")
    let protoMsg = event.detail
    await proto.setProtoDef("fabricMessage.signedProposal");
    let encodedMsg = proto.encodeProtoMsg(protoMsg)
    console.log("encodedMsg : ", encodedMsg)
    let resp = await postData("submitTxn", encodedMsg)
    console.log(resp)
  },
  true
);
