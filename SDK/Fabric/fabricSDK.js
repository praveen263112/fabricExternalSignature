const fs = require("fs");
const Client = require("fabric-client");

class fabricOffline {
  constructor(channelId) {
    this.Client = new Client();
    this.channel = this.Client.newChannel(channelId);
    this.channelID = channelId;
  }

  getTransactionReq(chaincodeID, fnName, args = []) {
    return {
      fcn: fnName,
      args: args,
      chaincodeId: chaincodeID,
      channelId: this.channelID
    };
  }
  addPeers(peerPEMCert, peerURL, peerName) {
    let peer = this.Client.newPeer(peerURL, {
      pem: peerPEMCert,
      "ssl-target-name-override": peerName
    });
    this.channel.addPeer(peer);
  }

  addOrderer(ordererPEMCert, ordererURL, ordererName) {
    let orderer = this.Client.newOrderer(ordererURL, {
      pem: ordererPEMCert,
      "ssl-target-name-override": ordererName
    });
    this.channel.addOrderer(orderer);
  }

  setEndorsingPeers(peerUrlList = []) {
    this.endorsingPeers = [];
    peerUrlList.forEach(peerUrl => {
      let peer = this.channel.getPeer(peerUrl);
      this.endorsingPeers.push(peer);
    });
  }

  generateProposal(transactionProposalReq, clientMspID, certPem) {
    let { proposal, txnID } = this.channel.generateUnsignedProposal(
      transactionProposalReq,
      clientMspID,
      certPem
    );

    return {
      proposal: proposal,
      txnID: txnID
    };
  }

  async endorseProposal(signedProposal) {
    let targets = this.endorsingPeers;
    let sendSignedProposalReq = { signedProposal, targets };
    let proposalResponses = await this.channel.sendSignedProposal(
      sendSignedProposalReq
    );
    return proposalResponses;
  }

  async generateCommitProposal(proposalResponses, proposal) {
    let commitReq = {
      proposalResponses,
      proposal
    };
    let Proposal = await this.channel.generateUnsignedTransaction(commitReq);

    return { commitRequest: commitReq, commitProposal: Proposal };
  }

  async postTransaction(signedCommitProposal, commitReq) {
    let response = await this.channel.sendSignedTransaction({
      signedProposal: signedCommitProposal,
      request: commitReq
    });
    return response;
  }
}

module.exports = {
  fabricOffline
};
