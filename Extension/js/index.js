
let proto = new fabricMsg.fabricProto("./proto/proposal.proto")

let signDataReq = null;
let dataType = null
let dataDef = null


function chechkData(type) {
  if (type == "signCommitProposal") {
    dataType = "signCommitProposalData";
    dataDef = "fabricMessage.commitProposal"
  } else if (type == "signProposal") {
    dataType = "signProposalData"
    dataDef = "fabricMessage.proposal"
  } else {
    alert("Error : invalid data in storage")
  }
}



async function getChromeData() {
  let data = localStorage.getItem("signData")
  displayData(data)
  let msgObj = JSON.parse(data)
  chechkData(msgObj.type)
  let msgBuf = new Uint8Array(msgObj.data);
  await proto.setProtoDef(dataDef);
  let protoMsg = proto.decodeMsgBuffer(msgBuf)
  console.log("object : ", protoMsg)
  signDataReq = protoMsg
  localStorage.setItem(dataType, null)
}


function displayData(value) {
  if (value != null) {
    document.getElementById("EnvelopedData").value = value;
    signDataReq = value;
  } else {
    console.log("no data in local storage");
  }
}

async function getKeyFile(fileName) {
  let filePath = "./keys/" + fileName;
  const url = chrome.runtime.getURL(filePath);
  let response = await fetch(url);
  return response.text();
}

async function signedData(event) {
  event.preventDefault();
  let signProposalBuf = null;
  if (dataType == "signProposalData") {
    signProposalBuf = signDataReq.proposalBuf;
  } else if (dataType == "signCommitProposalData") {
    signProposalBuf = signDataReq.commitBuf;
  }

  console.log(" Proposal Buffer : ", signProposalBuf)
  let priveKeyPem = await getKeyFile(
    "7d9009330bcf84ffd62c41976d260c5f9bb6cd0d9bc876b2f00b2bb8abcb19a7_sk"
  );
  console.log("proposal to be signed : ", signProposalBuf);
  let signedValueHex = fabricSigner.signProposal(signProposalBuf, priveKeyPem);
  await proto.setProtoDef("fabricMessage.signedProposal");
  let signProto = proto.createProtoMsg({ "signature": signedValueHex.signature, "proposalBytes": signedValueHex.proposal_bytes })
  console.log(signProto)
  let signedProposalBuf = proto.encodeProtoMsg(signProto);
  console.log("msg buffer : ", signedProposalBuf)
  var Data = {
    // Create a view
    data: Array.apply(null, new Uint8Array(signedProposalBuf)),
    contentType: 'application/octet-stream'
  };
  let transportData = JSON.stringify(Data)
  var bgPage = chrome.extension.getBackgroundPage();
  bgPage.sendSignedValue(transportData, dataType);
}

document
  .getElementById("confirmBtn")
  .addEventListener("click", function (event) {
    signedData(event);
  });
window.onload = getChromeData();
