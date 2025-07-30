import Invoice from "../models/Invoice.js";
import { generateInvoice } from "../utils/invoice.js";

export const createInvoice = async (req, res) => {
  try {
    const newInvoice = await generateInvoice(req.body);
    res.status(201).json({
      success: true,
      data: newInvoice,
    });
  } catch (error) {
    console.error("Error creating invoice:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate("doctorId", "firstName lastName")
      .populate("subscription", "planName price");

    res.status(200).json({
      success: true,
      data: invoices,
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      invoiceId: req.params.id,
    })
      .populate("doctorId", "firstName lastName")
      .populate("subscription", "planName price");

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const updateInvoiceStatus = async (req, res) => {
  try {
    const { invoiceId, status } = req.body;

    if (!invoiceId || !status) {
      return res.status(400).json({
        success: false,
        message: "Invoice ID and status are required",
      });
    }

    const updatedInvoice = await Invoice.findOneAndUpdate(
      { invoiceId },
      { status },
      { new: true }
    );

    if (!updatedInvoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedInvoice,
    });
  } catch (error) {
    console.error("Error updating invoice status:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    if (!invoiceId) {
      return res.status(400).json({
        success: false,
        message: "Invoice ID is required",
      });
    }

    const deletedInvoice = await Invoice.findOneAndDelete({ invoiceId });

    if (!deletedInvoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
