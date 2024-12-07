const express = require("express");
const multer = require("multer");
const { PDFDocument } = require("pdf-lib");
const officegen = require("officegen");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const app = express();
const upload = multer({ dest: "uploads/" });

// Ana sayfa
app.get("/", (req, res) => {
  res.send(`
    <h1>Dosya Dönüştürücü</h1>
    <form action="/convert" method="POST" enctype="multipart/form-data">
      <label for="conversionType">Dönüştürme Türü:</label>
      <select name="conversionType" id="conversionType">
        <option value="word_to_pdf">Word to PDF</option>
        <option value="pdf_to_word">PDF to Word</option>
        <option value="image_to_jpg">Image to JPG</option>
      </select>
      <br><br>
      <label for="file">Dosya Seç:</label>
      <input type="file" name="file" id="file" required />
      <br><br>
      <button type="submit">Dönüştür</button>
    </form>
  `);
});

// Dosya dönüştürme
app.post("/convert", upload.single("file"), async (req, res) => {
  const { conversionType } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).send("Dosya yüklenmedi.");
  }

  const outputDir = "converted";
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  try {
    let outputFilePath;

    switch (conversionType) {
      case "word_to_pdf":
        // Word to PDF dönüşümü
        const docxPath = file.path;
        const pdfDoc = await PDFDocument.create();
        pdfDoc.addPage([600, 800]); // Basit örnek
        outputFilePath = path.join(outputDir, `${file.originalname}.pdf`);
        fs.writeFileSync(outputFilePath, await pdfDoc.save());
        break;

      case "pdf_to_word":
        // PDF to Word dönüşümü
        const pdfText = fs.readFileSync(file.path, "utf-8"); // Basit bir örnek
        const docx = officegen("docx");
        const pObj = docx.createP();
        pObj.addText(pdfText);

        outputFilePath = path.join(outputDir, `${file.originalname}.docx`);
        const out = fs.createWriteStream(outputFilePath);
        docx.generate(out);
        break;

      case "image_to_jpg":
        // Resim dönüşümü (ör. PNG, WEBP -> JPG)
        outputFilePath = path.join(outputDir, `${path.parse(file.originalname).name}.jpg`);
        await sharp(file.path).jpeg().toFile(outputFilePath);
        break;

      default:
        return res.status(400).send("Geçersiz dönüştürme türü.");
    }

    res.download(outputFilePath, (err) => {
      if (err) throw err;

      // Geçici dosyaları temizle
      fs.unlinkSync(file.path);
      fs.unlinkSync(outputFilePath);
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Dönüştürme sırasında bir hata oluştu.");
  }
});

// Sunucu başlat
const PORT = 443;
app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} üzerinde çalışıyor.`);
});
