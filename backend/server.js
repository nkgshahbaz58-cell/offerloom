const express = require('express');
const multer = require('multer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors()); // If frontend and backend are on different origins
app.use(express.static('public')); // Serves index.html and other static files

app.post('/convert', upload.array('images'), (req, res) => {
  const doc = new PDFDocument();
  const outputPath = path.join(__dirname, 'output.pdf');
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  req.files.forEach(file => {
    doc.addPage();
    doc.image(file.path, {
      fit: [500, 700],
      align: 'center',
      valign: 'center'
    });
  });

  doc.end();

  stream.on('finish', () => {
    res.download(outputPath, 'converted.pdf', () => {
      req.files.forEach(file => fs.unlinkSync(file.path));
      fs.unlinkSync(outputPath);
    });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));
