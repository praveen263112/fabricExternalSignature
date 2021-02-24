var protobuf = require("protobufjs");

class fabricProto {
  constructor() {
    this.protoScheam = null;
    this.protoDef = null;
  }

  async setProtoDef(protoFilePath, messageDef) {
    try {
      this.protoScheam = await protobuf.load(protoFilePath);
    } catch (e) {
      console.log("proto file error : ", e);
    }
    this.protoDef = this.protoScheam.lookupType(messageDef);
  }

  verifyMessage(messageObj) {
    var isOK = false;
    var errMsg = this.protoDef.verify(messageObj);
    if (errMsg == null) {
      isOK = true;
    }
    return isOK;
  }
  createProtoMsg(messageObj) {
    if (this.verifyMessage(messageObj)) {
      return this.protoDef.create(messageObj);
    } else {
      console.log(
        "Invalid Format Error : messageObj dosen't match definition proto file"
      );
    }
  }
  encodeProtoMsg(ProtoMsg) {
    return this.protoDef.encode(ProtoMsg).finish();
  }
  decodeMsgBuffer(msgBuffer) {
    return this.protoDef.decode(msgBuffer);
  }
  objectifyMsg(ProtoMsg) {
    return this.protoDef.toObject(ProtoMsg);
  }
}

module.exports = {
  fabricProto
};
