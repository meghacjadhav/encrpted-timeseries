const crypto = require("crypto");
const io = require("socket.io")(3000);
const { MongoClient } = require("mongodb");

function decrypt(msg) {
  let iv = Buffer.from(msg.iv, "hex");
  let encryptedText = Buffer.from(msg.encryptedData, "hex");

  let decipher = crypto.createDecipheriv("aes-256-ctr", msg.key, iv);

  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}

io.on("connect", (socket) => {
  socket.on("EmitterServiceMsg", (msg) => {
    const decryptedMsg = decrypt(msg);
    const IncomingMsg = JSON.parse(decryptedMsg);
    const { name, origin, dst, secretKey } = IncomingMsg;
    const resSecretKey = crypto
      .createHash("sha256")
      .update(JSON.stringify({ name, origin, dst }))
      .digest("hex");

    if (secretKey === resSecretKey) {
      const dataBase = new MongoClient("mongodb://localhost:27017");
      async () => {
        try {
          await dataBase.connect();
          const edb = dataBase.db("EncrytedDatabase");
          const collection = edb.collection("Emitter_Listener");
          IncomingMsg.timestamp = new Date();
          await collection.insertOne(IncomingMsg);
          console.log("Object saved to database", IncomingMsg);
          io.emit('savedData', IncomingMsg);
        } catch (e) {
          console.log(e);
        } finally {
          dataBase.close();
        }
      };
    }
  });
});
