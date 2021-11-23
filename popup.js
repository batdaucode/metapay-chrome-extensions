function genQRCode(data) {
  const qrCode = new QRCodeStyling({
    width: 200,
    height: 200,
    type: "svg",
    data,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg",
    dotsOptions: {
      color: "#000000",
      type: "rounded",
    },
    backgroundOptions: {
      color: "#e9ebee",
    },
    imageOptions: {
      crossOrigin: "anonymous",
      margin: 10,
    },
  });

  qrCode.append(document.getElementById("qrcode"));
}

const uniqueId = () => {
  const dateString = Date.now().toString(36);
  const randomness = Math.random().toString(36).substr(2);
  return dateString + randomness;
};

function checkAuth() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "CHECK_AUTH" });
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === "AUTH_RESULT") {
        return resolve(msg);
      }
    });
  });
}

async function init() {
  const socket = io("http://localhost:3000");
  const dataAuth = await checkAuth();
  if (!dataAuth.isLogin) {
    document.getElementById("login").style.display = "block";
    document.getElementById("history").style.display = "none";
    socket.emit("qr-login", { browserId: uniqueId() });
    socket.on("qr-login", (data) => {
      const serverId = data.serverId;
      genQRCode(serverId);
    });

    socket.on("qr-login-done", (data) => {
      const accessToken = data.accessToken;
      const refreshToken = data.refreshToken;

      chrome.runtime.sendMessage(
        { type: "SAVE_AUTH", accessToken, refreshToken },
        function (response) {
          console.log(response);
        }
      );
    });
  } else {
    document.getElementById("login").style.display = "none";
    document.getElementById("history").style.display = "block";
  }

  const viewHistory = document.getElementById("view-history");
  const extensionId = "";
  viewHistory.href = `chrome-extension://${extensionId}/options.html`;
}

init();
