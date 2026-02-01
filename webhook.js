const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const sendWhatsApp = require("./whatsapp");

const DATA_FILE = "./data/files.json";
fs.ensureFileSync(DATA_FILE);

module.exports = async (req, res) => {
  try {
    const msg = req.body.message;
    if (!msg) return res.sendStatus(200);

    // Get file from message (document or last photo)
    const file = msg.document || (msg.photo && msg.photo[msg.photo.length - 1]);
    if (!file) return res.sendStatus(200);

    const fileId = file.file_id;

    // Get Telegram file info
    const tgRes = await axios.get(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/getFile?file_id=${fileId}`
    );
    if (!tgRes.data.ok) throw new Error("Failed to get file info");

    const filePath = tgRes.data.result.file_path;
    console.log("Telegram file path:", filePath);

    const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${filePath}`;
    const fileName = path.basename(filePath);
    const uploadsDir = path.join(__dirname, "uploads");
    await fs.ensureDir(uploadsDir);

    const localFileName = `${Date.now()}_${fileName}`;
    const localPath = path.join(uploadsDir, localFileName);

    // Download file and wait until fully saved
    await new Promise((resolve, reject) => {
      const stream = fs.createWriteStream(localPath);
      axios({ url: fileUrl, responseType: "stream" })
        .then(response => {
          response.data.pipe(stream);
          stream.on("finish", resolve);
          stream.on("error", reject);
        })
        .catch(reject);
    });

    // Save metadata AFTER file is downloaded
    const meta = await fs.readJson(DATA_FILE, { throws: false }) || [];
    meta.push({
      fileName,
      path: `/uploads/${localFileName}`, // frontend-friendly path
      createdAt: Date.now()
    });
    await fs.writeJson(DATA_FILE, meta, { spaces: 2, flag: "w" });

    console.log("File saved and metadata updated:", localFileName);

    // Send WhatsApp notification
    await sendWhatsApp(`📂 New file received:\n${fileName}`);

    res.sendStatus(200);
  } catch (err) {
    console.error("Error handling file:", err.message);
    res.sendStatus(500);
  }
};
