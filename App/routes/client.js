const { fabricOffline } = require("./Fabric/fabricSDK");
const { signProposal } = require("./Fabric/fabricSigner")
const fs = require("fs");
const { fabricProto } = require("./Fabric/proto");
const certPath = "./routes/certificates/Admin@manufacturer.auto.com-cert.pem";
const privateKeyPath =
  "./routes/keys/7d9009330bcf84ffd62c41976d260c5f9bb6cd0d9bc876b2f00b2bb8abcb19a7_sk";

const privateKeyPem = fs.readFileSync(privateKeyPath, "utf8");
const certPem = fs.readFileSync(certPath, "utf8");
let offlineClient = new fabricOffline("autochannel");
let proto = new fabricProto();
let DealerpeerTLSCertPath = "./routes/tls/tlsca.dealer.auto.com-cert.pem";
let DealerPEMCert = fs.readFileSync(DealerpeerTLSCertPath, "utf8");

let DealerPeerUrl = "grpc://127.0.0.1:7051";
let DealerPeerName = "peer0.dealer.auto.com";
offlineClient.addPeers(DealerPEMCert, DealerPeerUrl, DealerPeerName);

let MVDpeerTLSCertPath = "./routes/tls/tlsca.mvd.auto.com-cert.pem";
let MVDPEMCert = fs.readFileSync(MVDpeerTLSCertPath, "utf8");

let MVDPeerUrl = "grpc://localhost:9051";
let MVDPeerName = "peer0.mvd.auto.com";
offlineClient.addPeers(MVDPEMCert, MVDPeerUrl, MVDPeerName);

let ManupeerTLSCertPath = "./routes/tls/tlsca.manufacturer.auto.com-cert.pem";
let ManuPEMCert = fs.readFileSync(ManupeerTLSCertPath, "utf8");

let ManuPeerUrl = "grpc://127.0.0.1:8051";
let ManuPeerName = "peer0.manufacturer.auto.com";
offlineClient.addPeers(ManuPEMCert, ManuPeerUrl, ManuPeerName);

let ordererTLSCertPath = "./routes/tls/tlsca.auto.com-cert.pem";
let ordererURL = "grpc://localhost:7050";
let ordererPEMCert = fs.readFileSync(ordererTLSCertPath, "utf8");

let ordererName = "orderer.auto.com";
offlineClient.addOrderer(ordererPEMCert, ordererURL, ordererName);
offlineClient.setEndorsingPeers([
  "127.0.0.1:8051",
  "127.0.0.1:7051",
  "localhost:9051"
]);
let proposalData = null;
let commitReq = null;

function generateProposalData(args) {
  let txnReq = offlineClient.getTransactionReq("my", "addBMW", args);
  proposalData = offlineClient.generateProposal(
    txnReq,
    "ManufacturerMSP",
    certPem
  );

  return proposalData;
}


async function generateCommitProposal(signedProposal) {
  let proposalResponses = await offlineClient.endorseProposal(signedProposal);

  let commitData = await offlineClient.generateCommitProposal(
    proposalResponses,
    proposalData.proposal
  );

  const commitProposal = commitData.commitProposal;
  commitReq = commitData.commitRequest;
  return commitProposal

}

async function submitTxn(signedCommitProposal) {
  let response = await offlineClient.postTransaction(
    signedCommitProposal,
    commitReq
  );
  console.log(response);
}

module.exports = { generateProposalData, generateCommitProposal, submitTxn };
