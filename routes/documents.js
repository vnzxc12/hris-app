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

  // Helper to upload buffer to Cloudinary
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
  // EMPLOYEE DOCUMENT ROUTES
  // ==============================

  // Get employee-specific documents
  router.get("/:employeeId/documents", authenticateToken, async (req, res) => {
    console.log("Authenticated user (GET employee docs):", req.user);
    const { employeeId } = req.params;
    console.log(`GET documents for employeeId: ${employeeId}`);

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
      console.log("Authenticated user (POST upload document):", req.user);
      const { employeeId } = req.params;
      console.log(`POST upload document for employeeId: ${employeeId}`);

      if (!req.file) {
        console.log("No file uploaded");
        return res.status(400).json({ error: "No file uploaded" });
      }
      console.log("Uploading file:", req.file.originalname, req.file.mimetype);

      try {
        const uploadResult = await streamUpload(req.file.buffer, "hris-documents");
        console.log("Cloudinary upload result:", uploadResult.secure_url);

        await db.query(
          "INSERT INTO documents (employee_id, file_name, file_type, file_url, category, is_global, uploaded_at) VALUES (?, ?, ?, ?, ?, 0, NOW())",
          [
            employeeId,
            req.file.originalname,
            req.file.mimetype,
            uploadResult.secure_url,
            "Employee" // category fixed here, you can modify if dynamic needed
          ]
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
    console.log("Authenticated user (GET global docs):", req.user);
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
      console.log("Authenticated user (POST upload global doc):", req.user);

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
          "INSERT INTO documents (employee_id, file_name, file_type, file_url, category, is_global, uploaded_at) VALUES (NULL, ?, ?, ?, ?, 1, NOW())",
          [
            req.file.originalname,
            req.file.mimetype,
            uploadResult.secure_url,
            "Global" // category fixed here
          ]
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
    console.log("Authenticated user (DELETE global doc):", req.user);

    const role = req.user?.role;
    if (!(role === "admin" || role === "superadmin")) {
      return res.status(403).json({ error: "Only admins can delete global documents" });
    }

    const { id } = req.params;
    try {
      const [rows] = await db.query(
        "SELECT file_url FROM documents WHERE id = ? AND is_global = 1",
        [id]
      );
      if (!rows.length) return res.status(404).json({ error: "Document not found" });

      // Optional: Delete from Cloudinary (not implemented here)
      await db.query("DELETE FROM documents WHERE id = ? AND is_global = 1", [id]);

      res.json({ message: "Global document deleted successfully" });
    } catch (err) {
      console.error("Failed to delete global document:", err);
      res.status(500).json({ error: "Failed to delete global document" });
    }
  });

  // Delete employee-specific document
  router.delete("/:employeeId/documents/:docId", authenticateToken, async (req, res) => {
    console.log("Authenticated user (DELETE employee doc):", req.user);

    const { employeeId, docId } = req.params;
    console.log(`DELETE document ${docId} for employee ${employeeId}`);

    const userRole = req.user?.role;
    const userEmployeeId = req.user?.employee_id;

    if (!(userRole === "admin" || userRole === "superadmin" || Number(userEmployeeId) === Number(employeeId))) {
      console.log("Unauthorized delete attempt");
      return res.status(403).json({ error: "Not authorized to delete this document" });
    }

    try {
      const [rows] = await db.query(
        "SELECT file_url FROM documents WHERE id = ? AND employee_id = ? AND is_global = 0",
        [docId, employeeId]
      );
      if (!rows.length) {
        console.log("Document not found");
        return res.status(404).json({ error: "Document not found" });
      }

      await db.query("DELETE FROM documents WHERE id = ? AND employee_id = ? AND is_global = 0", [docId, employeeId]);

      console.log("Deleted document successfully");
      res.json({ message: "Employee document deleted successfully" });
    } catch (err) {
      console.error("Failed to delete employee document:", err);
      res.status(500).json({ error: "Failed to delete employee document" });
    }
  });

  // Catch all error handler for this router
  router.use((err, req, res, next) => {
    console.error("Unhandled error in documents router:", err);
    res.status(500).json({ error: "Internal server error" });
  });

  return router;
};
