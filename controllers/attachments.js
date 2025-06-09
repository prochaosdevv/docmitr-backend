import { formidable } from "formidable";
import fs from "fs";
import AWS from "aws-sdk";
import Attachment from "../models/Attachment.js";

const s3Client = new AWS.S3({
  secretAccessKey: process.env.ACCESS_KEY,
  accessKeyId: process.env.ACCESS_ID,
  region: process.env.region,
});

export const createAttachment = async (req, res) => {
  const form = formidable({
    maxFileSize: 1 * 1024 * 1024 * 1024, // 1 GB
    multiples: false,
  });

  let filePath,
    fileName,
    fileType,
    fields = {};

  form.parse(req);

  form.on("field", (name, value) => {
    fields[name] = value;
  });

  form.on("file", (name, file) => {
    if (["image", "file", "attachment"].includes(name)) {
      filePath = file.filepath || file.path;
      fileName = file.originalFilename || file.newFilename;
      fileType = file.mimetype || "application/octet-stream";
    }
  });

  form.on("end", async () => {
    if (!filePath) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      const buffer = fs.readFileSync(filePath);
      const extension = fileName.split(".").pop().toLowerCase();
      const s3Key = `attachments/${Date.now()}_${fileName}`;

      const upload = await s3Client
        .upload({
          Bucket: process.env.IMAGE_BUCKET,
          Key: s3Key,
          Body: buffer,
          ContentType: fileType,
        })
        .promise();

      const doctorId = req.user.id;
      const patientId = fields.patientId;
      const date = new Date(fields.attachmentDate || new Date());

      let type = "document";
      if (fileType.startsWith("image/")) type = "image";
      else if (fileType.startsWith("video/")) type = "video";
      else if (fileType.startsWith("audio/")) type = "audio";

      const newAttachment = {
        attachmentS3Url: upload.Location,
        attachmentExtension: extension,
        attachmentType: type,
      };

      // Try to find existing attachment entry for same day
      let existing = await Attachment.findOne({
        patientId,
      });

      let savedAttachment;

      if (existing) {
        existing.attachmentList.push(newAttachment);
        savedAttachment = await existing.save();
      } else {
        const attachment = new Attachment({
          attachmentDate: date,
          patientId,
          doctorId,
          attachmentList: [newAttachment],
        });
        savedAttachment = await attachment.save();
      }

      res.status(201).json({
        success: true,
        message: "Attachment uploaded successfully",
        attachment: savedAttachment,
      });
    } catch (err) {
      console.error("Upload Error:", err);
      res
        .status(500)
        .json({ error: "Attachment creation failed: " + err.message });
    }
  });

  form.on("error", (err) => {
    console.error("Formidable Error:", err);
    return res.status(500).json({ error: "Error parsing form data" });
  });
};

export const getAttachmentsByPatientId = async (req, res) => {
  const { patientId } = req.params;

  if (!patientId) {
    return res.status(400).json({ error: "Patient ID is required" });
  }

  try {
    const attachments = await Attachment.findOne({ patientId })
      .populate("doctorId", "name email role")
      .sort({ attachmentDate: -1 });

    console.log("Attachments retrieved for patient:", attachments);

    if (!attachments) {
      return res.status(200).json({
        message: "No attachments found for this patient",
        attachments: [],
      });
    }

    res.status(200).json({
      status: true,
      message: "Attachments retrieved successfully",
      attachments,
    });
  } catch (err) {
    console.error("Error retrieving attachments:", err);
    res.status(500).json({ error: err });
  }
};

export const deleteAttachment = async (req, res) => {
  try {
    const { attachmentlistId, attachmentId } = req.params;

    if (!attachmentlistId || !attachmentId) {
      return res.status(400).json({ error: "Attachment ID is required" });
    }

    const attachment = await Attachment.findById(attachmentlistId);
    if (!attachment) {
      return res.status(404).json({ error: "Attachment not found" });
    }

    // Remove the specific attachment from the list
    const updatedAttachmentList = attachment.attachmentList.filter(
      (att) => att._id.toString() !== attachmentId
    );

    if (updatedAttachmentList.length === attachment.attachmentList.length) {
      return res.status(404).json({ error: "Attachment not found in list" });
    }

    // Update the attachment document
    attachment.attachmentList = updatedAttachmentList;
    const updatedAttachment = await attachment.save();

    // If the attachment list is now empty, delete the entire attachment document
    if (updatedAttachment.attachmentList.length === 0) {
      await Attachment.findByIdAndDelete(attachmentlistId);
      return res
        .status(200)
        .json({ message: "Attachment deleted successfully" });
    }

    res.status(200).json({
      message: "Attachment deleted successfully",
      attachment: updatedAttachment,
    });
  } catch (err) {
    console.error("Error deleting attachment:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
