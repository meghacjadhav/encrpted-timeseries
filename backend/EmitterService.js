const fs = require("fs");
const crypto = require("crypto");
var io = require("socket.io-client");
var socket = io.connect("http://localhost:3000", { reconnect: true });
const data = JSON.parse(fs.readFileSync("./data.json", "utf-8"));
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

function encrypt(msg) {
  const cipher = crypto.createCipheriv("aes-256-ctr", Buffer.from(key), iv);

  let encrypted = cipher.update(msg);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString("hex"), key:Buffer.from(key), encryptedData: encrypted.toString("hex") };
}

function createMsg() {
  const name = data.names[Math.floor(Math.random() * data.names.length)];
  const origin = data.cities[Math.floor(Math.random() * data.cities.length)];
  const dst = data.cities[Math.floor(Math.random() * data.cities.length)];

  const originalMsg = { name, origin, dst };

  const secretKey = crypto
    .createHash("sha256")
    .update(JSON.stringify(originalMsg))
    .digest("hex");

  const sumCheckMsg = JSON.stringify({ ...originalMsg, secretKey });

  const encryptedMgs = encrypt(sumCheckMsg);

  return encryptedMgs;
}

socket.on("connect", function (socket) {
  console.log("Connected!");
});
setInterval(() => {
  console.log("sending...");
  const msg = createMsg();
  socket.emit("EmitterServiceMsg", msg);
}, 10000);
