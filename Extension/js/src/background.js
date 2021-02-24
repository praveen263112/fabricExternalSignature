chrome.runtime.onMessage.addListener(processMsg);

function processMsg(req, sender, sendResponse) {
  let data = req.data
  let badge = ""
  if (req.msg == "signProposal") {
    badge = "+P"
  } else if (req.msg == "signCommitProposal") {
    badge = "+C"
  }
  handleReq(data, badge)
  sendResponse({ "msg": "ok" })
}

function handleReq(Data, Badge) {
  chrome.browserAction.setBadgeText({ text: Badge });
  localStorage.setItem("signData", Data)

}

function sendSignedValue(signedValue, dataType) {
  console.log("sending signed value back to context");
  chrome.browserAction.setBadgeText({ text: "" });
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { msg: dataType, data: signedValue }, function (response) {
      console.log(response)
    });
  });
}
