const express = require("express");
const router = express.Router();
const multer = require("multer");
const supabase = require("../../../config/supabaseClient");
// your supabase client

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload", upload.single("files"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const bucketName = "Images";
    const fileName = `${Date.now()}_${req.file.originalname}`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
      });

    if (error) {
      console.error("Upload error:", error);
      return res.status(500).json({ error: "Failed to upload image." });
    }

    const image = supabase.storage.from(bucketName).getPublicUrl(fileName);

    res.status(200).json({
      message: "Image uploaded successfully!",
      file: {
        fileName,
        publicUrl: image.data.publicUrl,
      },
    });
  } catch (err) {
    console.error("Error during upload:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

router.post("/upload-multiple", upload.array("files", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded." });
    }

    const bucketName = "Images";
    const uploadedFiles = [];

    for (const file of req.files) {
      const fileName = `${Date.now()}_${file.originalname}`;

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
        });

      if (error) {
        console.error("Error uploading:", error);
        return res
          .status(500)
          .json({ error: "One or more images failed to upload." });
      }

      const publicUrl = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      uploadedFiles.push({
        originalName: file.originalname,
        fileName: fileName,
        path: publicUrl.data.publicUrl,
      });
    }

    res.status(200).json({
      message: "Images uploaded successfully!",
      files: uploadedFiles,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
