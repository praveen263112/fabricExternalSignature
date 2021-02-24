var express = require("express");
var router = express.Router();
const { fabricProto } = require("./Fabric/proto");
const { generateProposalData, generateCommitProposal, submitTxn } = require("./client");

let payloadProto = new fabricProto(__dirname + "/proto/proposal.proto");
let proposalProto = new fabricProto(__dirname + "/proto/proposal.proto");
/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("manufacturer", { title: "Manufacturer Dash" });
});

router.get("/table", function (req, res, next) {
  res.render("table", { title: "table" });
});

router.post("/getProposal", async function (req, res) {
  await payloadProto.setProtoDef("fabricMessage.payload");
  let payloadProtoBuf = payloadProto.decodeMsgBuffer(req.body);
  let payload = payloadProtoBuf.payload;


  let proposalData = generateProposalData(payload);
  await proposalProto.setProtoDef(
    "fabricMessage.proposal"
  );
  let proposal = proposalData.proposal;
  let proposalBufMsg = proposalProto.createProtoMsg({
    proposalBuf: proposal.toBuffer()
  });
  let resBuffer = proposalProto.encodeProtoMsg(proposalBufMsg);
  res.header({
    "Content-Type": "application/octet-stream"
  });

  res.end(resBuffer, "binary");

  // res.sen({ msg: "helol" });
});

router.post("/getCommitProposal", async function (req, res) {
  console.log("data cp: ", req.body);
  const signProto = new fabricProto(__dirname + "/proto/proposal.proto");
  await signProto.setProtoDef(
    "fabricMessage.signedProposal"
  );
  let signProtoMsg = signProto.decodeMsgBuffer(req.body);
  console.log("signProtoMsg : ", signProtoMsg)
  let signObj = { "signature": signProtoMsg.signature, "proposal_bytes": signProtoMsg.proposalBytes }
  let commitProposal = await generateCommitProposal(signObj)
  await signProto.setProtoDef(
    "fabricMessage.commitProposal"
  );
  let commitProtoMsg = proposalProto.createProtoMsg({
    commitBuf: commitProposal.toBuffer()
  });
  console.log("Commit Proposal : ", commitProtoMsg)
  let commitBufMsg = signProto.encodeProtoMsg(commitProtoMsg);
  console.log("CommitBufMSg : ", commitBufMsg)
  res.header({
    "Content-Type": "application/octet-stream"
  });

  res.end(commitBufMsg, "binary");
});

router.post("/submitTxn", async function (req, res) {
  console.log("data st : ", req.body);
  const signProto = new fabricProto(__dirname + "/proto/proposal.proto");
  await signProto.setProtoDef(
    "fabricMessage.signedProposal"
  );
  let signProtoMsg = signProto.decodeMsgBuffer(req.body);
  console.log("signProtoMsg : ", signProtoMsg)
  let signObj = { "signature": signProtoMsg.signature, "proposal_bytes": signProtoMsg.proposalBytes }
  await submitTxn(signObj)
  res.send({ "Transaction": "submitted" })
})



module.exports = router;
