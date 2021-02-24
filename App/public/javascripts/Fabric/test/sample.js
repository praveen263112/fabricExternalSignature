const { fabricProto } = require("../proto");
const { fabricOffline } = require("../fabricSDK");
const { signProposal } = require("../fabricSigner");
const fs = require("fs");
const certPath = "./certificates/Admin@manufacturer.auto.com-cert.pem";
const privateKeyPath =
  "./keys/7d9009330bcf84ffd62c41976d260c5f9bb6cd0d9bc876b2f00b2bb8abcb19a7_sk";

const privateKeyPem = fs.readFileSync(privateKeyPath, "utf8");
const certPem = fs.readFileSync(certPath, "utf8");

async function main() {
  let protoObj = new fabricProto();
  let offlineClient = new fabricOffline("autochannel");

  let DealerpeerTLSCertPath = "./tls/tlsca.dealer.auto.com-cert.pem";
  let DealerPEMCert = fs.readFileSync(DealerpeerTLSCertPath, "utf8");

  let DealerPeerUrl = "grpc://127.0.0.1:7051";
  let DealerPeerName = "peer0.dealer.auto.com";
  offlineClient.addPeers(DealerPEMCert, DealerPeerUrl, DealerPeerName);

  let MVDpeerTLSCertPath = "./tls/tlsca.mvd.auto.com-cert.pem";
  let MVDPEMCert = fs.readFileSync(MVDpeerTLSCertPath, "utf8");

  let MVDPeerUrl = "grpc://localhost:9051";
  let MVDPeerName = "peer0.mvd.auto.com";
  offlineClient.addPeers(MVDPEMCert, MVDPeerUrl, MVDPeerName);

  let ManupeerTLSCertPath = "./tls/tlsca.manufacturer.auto.com-cert.pem";
  let ManuPEMCert = fs.readFileSync(ManupeerTLSCertPath, "utf8");

  let ManuPeerUrl = "grpc://127.0.0.1:8051";
  let ManuPeerName = "peer0.manufacturer.auto.com";
  offlineClient.addPeers(ManuPEMCert, ManuPeerUrl, ManuPeerName);

  let ordererTLSCertPath = "./tls/tlsca.auto.com-cert.pem";
  let ordererURL = "grpc://localhost:7050";
  let ordererPEMCert = fs.readFileSync(ordererTLSCertPath, "utf8");

  let ordererName = "orderer.auto.com";
  offlineClient.addOrderer(ordererPEMCert, ordererURL, ordererName);

  let ID = Math.random();
  let args = [ID.toString(), "r", "a", "m", "a", "n"];
  let transactionProposalReq = offlineClient.getTransactionReq(
    "my",
    "addBMW",
    args
  );

  let proposalData = offlineClient.generateProposal(
    transactionProposalReq,
    "ManufacturerMSP",
    certPem
  );

  let proposal = proposalData.proposal;
  await protoObj.setProtoDef(
    "../proto/proposal.proto",
    "fabricMessage.proposal"
  );
  let protoMsg = protoObj.createProtoMsg({ proposalBuf: proposal.toBuffer() });
  let protoMsgBuf = protoObj.encodeProtoMsg(protoMsg);
  console.log("buffer : ", protoMsgBuf);
  let protoMsgBufMsg = protoObj.decodeMsgBuffer(protoMsgBuf);
  console.log(protoMsgBufMsg.proposalBuf);
  let signedProposal = signProposal(protoMsg.proposalBuf, privateKeyPem);

  offlineClient.setEndorsingPeers([
    "127.0.0.1:8051",
    "127.0.0.1:7051",
    "localhost:9051"
  ]);

  let proposalResponses = await offlineClient.endorseProposal(signedProposal);

  let commitData = await offlineClient.generateCommitProposal(
    proposalResponses,
    proposal
  );

  let commitProposal = commitData.commitProposal;
  let commitReq = commitData.commitRequests;

  const signedCommitProposal = signProposal(
    commitProposal.toBuffer(),
    privateKeyPem
  );

  let response = await offlineClient.postTransaction(
    signedCommitProposal,
    commitReq
  );
  console.log(response);
}

main();
