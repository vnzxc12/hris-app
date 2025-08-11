const express = require("express");
const db = require("../db");
const { uploader } = require("cloudinary").v2;
const multer = require("multer");
const authenticateToken = require("./verifyToken");

const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = (documentUpload) => {
  const router = express.Router();

  // ==============================
  // EMPLOYEE DOCUMENT ROUTES
  // ==============================

  // Get employee-specific documents
  router.get("/:employeeId/documents", authenticateToken, async (req, res) => {
    const { employeeId } = req.params;
    try {
      const [rows] = await db.query(
        "SELECT * FROM documents WHERE employee_id = ? AND is_global = 0",
        [employeeId]
      );
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch employee documents" });
    }
  });

  // Upload employee-specific document
  router.post(
    "/:employeeId/documents",
    authenticateToken,
    upload.single("file"),
    async (req, res) => {
      const { employeeId } = req.params;

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      try {
        const result = await uploader.upload_stream(
          { folder: "hris-documents" },
          async (error, uploadResult) => {
            if (error) {
              console.error(error);
              return res.status(500).json({ error: "Upload to Cloudinary failed" });
            }

            await db.query(
              "INSERT INTO documents (employee_id, file_name, file_url, is_global) VALUES (?, ?, ?, 0)",
              [employeeId, req.file.originalname, uploadResult.secure_url]
            );

            res.status(201).json({ message: "Employee document uploaded successfully" });
          }
        );

        result.end(req.file.buffer);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to upload employee document" });
      }
    }
  );

  // ==============================
  // GLOBAL DOCUMENT ROUTES
  // ==============================

  // Get all global documents
  router.get("/global", async (req, res) => {
    try {
      const [rows] = await db.query(
        "SELECT * FROM documents WHERE is_global = 1 ORDER BY uploaded_at DESC"
      );
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch global documents" });
    }
  });

  // Upload global document (Admin only)
  router.post(
    "/global",
    authenticateToken,
    upload.single("file"),
    async (req, res) => {
      if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Only admins can upload global documents" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      try {
        const result = await uploader.upload_stream(
          { folder: "hris-global-documents" },
          async (error, uploadResult) => {
            if (error) {
              console.error(error);
              return res.status(500).json({ error: "Upload to Cloudinary failed" });
            }

            await db.query(
              "INSERT INTO documents (employee_id, file_name, file_url, is_global) VALUES (NULL, ?, ?, 1)",
              [req.file.originalname, uploadResult.secure_url]
            );

            res.status(201).json({ message: "Global document uploaded successfully" });
          }
        );

        result.end(req.file.buffer);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to upload global document" });
      }
    }
  );

  // Delete global document (Admin only)
  router.delete("/global/:id", authenticateToken, async (req, res) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admins can delete global documents" });
    }

    const { id } = req.params;
    try {
      await db.query("DELETE FROM documents WHERE id = ? AND is_global = 1", [id]);
      res.json({ message: "Global document deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to delete global document" });
    }
  });

  return router;
};
