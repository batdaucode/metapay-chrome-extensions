function isEmpty(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}

chrome.runtime.onMessage.addListener(messageReceived);
function messageReceived(msg) {
  console.log(msg);
  const type = msg.type;
  switch (type) {
    case "SAVE_AUTH":
      const value = {
        accessToken: msg.accessToken,
        refreshToken: msg.refreshToken,
      };
      chrome.storage.local.set({ METAPAY_AUTH: value }, function () {
        console.log("Value is set to " + value);
      });
      return true;
    case "CHECK_AUTH":
      chrome.storage.local.get(["METAPAY_AUTH"], function(items){
        if(isEmpty(items)) {
          chrome.runtime.sendMessage({type: 'AUTH_RESULT', isLogin: false});
          return true;
        }
        const data = items.METAPAY_AUTH;
        chrome.runtime.sendMessage({type: 'AUTH_RESULT', isLogin: true, accessToken: data.accessToken, refreshToken: data.refreshToken});
        return true;
    });
      

    default:
      break;
  }
  
}
