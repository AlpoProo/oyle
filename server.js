const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { PDFDocument } = require("pdf-lib");
const mammoth = require("mammoth");
const sharp = require("sharp");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.static(path.join(__dirname)));

// Ana Sayfa
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Dosya Dönüştürme
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
      case "word_to_pdf": {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 400]);
        const { value: docText } = await mammoth.extractRawText({ path: file.path });
        page.drawText(docText || "Empty document.");
        const pdfBytes = await pdfDoc.save();
        outputFilePath = path.join(outputDir, `${file.originalname}.pdf`);
        fs.writeFileSync(outputFilePath, pdfBytes);
        break;
      }

      case "pdf_to_text": {
        const pdfDoc = await PDFDocument.load(fs.readFileSync(file.path));
        const text = pdfDoc.getPage(0).getTextContent(); // Basit bir örnek
        outputFilePath = path.join(outputDir, `${file.originalname}.txt`);
        fs.writeFileSync(outputFilePath, text);
        break;
      }

      case "image_to_jpg": {
        outputFilePath = path.join(outputDir, `${path.parse(file.originalname).name}.jpg`);
        await sharp(file.path).jpeg().toFile(outputFilePath);
        break;
      }

      default:
        return res.status(400).send("Geçersiz dönüştürme türü.");
    }

    res.download(outputFilePath, () => {
      fs.unlinkSync(file.path); // Yüklenen dosyayı sil
      fs.unlinkSync(outputFilePath); // Çıktı dosyasını sil
    });
  } catch (error) {
    console.error("Hata:", error);
    res.status(500).send("Dönüştürme sırasında bir hata oluştu.");
  }
});

// Sunucu Başlat
const PORT = process.env.PORT || 3131;
app.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});
