const express = require("express");
const db = require("../db");
const { uploader } = require("cloudinary").v2;
const multer = require("multer");
const authenticateToken = require("./verifyToken");
const streamifier = require("streamifier");

const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = () => {
  const router = express.Router();

  // Helper to upload buffer to Cloudinary (returns promise)
  const streamUpload = (buffer, folder = "hris-documents") =>
    new Promise((resolve, reject) => {
      const uploadStream = uploader.upload_stream(
        { folder, resource_type: "auto" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      streamifier.createReadStream(buffer).pipe(uploadStream);
    });

  // ==============================
  // EMPLOYEE DOCUMENT ROUTES (unchanged)
  // ==============================

  // Get employee-specific documents
  router.get("/:employeeId/documents", authenticateToken, async (req, res) => {
    const { employeeId } = req.params;
    try {
      const [rows] = await db.query(
        "SELECT * FROM documents WHERE employee_id = ? AND is_global = 0 ORDER BY uploaded_at DESC",
        [employeeId]
      );
      res.json(rows);
    } catch (err) {
      console.error("Failed to fetch employee documents:", err);
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
        const uploadResult = await streamUpload(req.file.buffer, "hris-documents");

        await db.query(
          "INSERT INTO documents (employee_id, file_name, file_url, is_global, uploaded_at) VALUES (?, ?, ?, 0, NOW())",
          [employeeId, req.file.originalname, uploadResult.secure_url]
        );

        res.status(201).json({ message: "Employee document uploaded successfully" });
      } catch (err) {
        console.error("Failed to upload employee document:", err);
        res.status(500).json({ error: "Failed to upload employee document" });
      }
    }
  );

  // ==============================
  // GLOBAL DOCUMENT ROUTES
  // ==============================

  // Get all global documents
  router.get("/global", authenticateToken, async (req, res) => {
    try {
      const [rows] = await db.query(
        "SELECT * FROM documents WHERE is_global = 1 ORDER BY uploaded_at DESC"
      );
      res.json(rows);
    } catch (err) {
      console.error("Failed to fetch global documents:", err);
      res.status(500).json({ error: "Failed to fetch global documents" });
    }
  });

  // Upload global document (admin or superadmin only)
  router.post(
    "/global",
    authenticateToken,
    upload.single("file"),
    async (req, res) => {
      const role = req.user?.role;
      if (!(role === "admin" || role === "superadmin")) {
        return res.status(403).json({ error: "Only admins can upload global documents" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      try {
        const uploadResult = await streamUpload(req.file.buffer, "hris-global-documents");

        await db.query(
          "INSERT INTO documents (employee_id, file_name, file_url, is_global, uploaded_at) VALUES (NULL, ?, ?, 1, NOW())",
          [req.file.originalname, uploadResult.secure_url]
        );

        res.status(201).json({ message: "Global document uploaded successfully" });
      } catch (err) {
        console.error("Failed to upload global document:", err);
        res.status(500).json({ error: "Failed to upload global document" });
      }
    }
  );

  // Delete global document (admin or superadmin only)
  router.delete("/global/:id", authenticateToken, async (req, res) => {
    const role = req.user?.role;
    if (!(role === "admin" || role === "superadmin")) {
      return res.status(403).json({ error: "Only admins can delete global documents" });
    }

    const { id } = req.params;
    try {
      // optional: fetch file_url to remove from cloudinary (if needed)
      const [rows] = await db.query("SELECT file_url FROM documents WHERE id = ? AND is_global = 1", [id]);
      if (!rows.length) return res.status(404).json({ error: "Document not found" });

      const fileUrl = rows[0].file_url;
      // attempt to remove from cloudinary if stored there (best-effort)
      try {
        const match = fileUrl.match(/\/([^/]+)\.(\w+)(?:$|\?)/); // minimal publicId extraction
        // skip if can't extract; you can implement more robust publicId extraction if needed
      } catch (err) {
        // ignore cloud deletion errors
      }

      await db.query("DELETE FROM documents WHERE id = ? AND is_global = 1", [id]);
      res.json({ message: "Global document deleted successfully" });
    } catch (err) {
      console.error("Failed to delete global document:", err);
      res.status(500).json({ error: "Failed to delete global document" });
    }
  });

  return router;
};
