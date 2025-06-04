// HistoryQuestionsController.js

import HistoryOption from "../models/HistoryOption.js";
import HistoryQuestions from "../models/HistoryQuestion.js";

// Create a new history question by admin
export const createHistoryQuestionByAdmin = async (req, res) => {
  try {
    const { qname, inputtype, type, title, templateId } = req.body;
    const admin = req.user;

    if (!qname || !inputtype || !type || !title) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newQuestion = await HistoryQuestions.create({
      qname,
      inputtype,
      type,
      title,
      templateId,
      doctorId: null,
      isAdmin: admin.role === "admin" ? true : false,
    });

    return res.status(201).json(newQuestion);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Create a new history question by doctor
export const createHistoryQuestionByDoctor = async (req, res) => {
  try {
    const { qname, inputtype, type, title, templateId, mainId } = req.body;
    const doctorId = req.user.id;

    if (type === "main" && (!qname || !type || !templateId)) {
      return res.status(400).json({ message: "Missing required fields" });
    } else if (
      type === "sub" &&
      (!inputtype || !title || !templateId || !mainId)
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newQuestion = await HistoryQuestions.create({
      qname,
      inputtype,
      type,
      title,
      templateId,
      doctorId,
    });

    if (type === "main") {
      await HistoryQuestions.findByIdAndUpdate(
        newQuestion._id,
        { mainId: newQuestion._id },
        { new: true }
      );
    }

    if (type === "sub") {
      const mainQuestion = await HistoryQuestions.findById(mainId);
      if (!mainQuestion) {
        return res.status(404).json({ message: "Main question not found" });
      }
      newQuestion.mainId = mainId;
      await newQuestion.save();
    }

    return res.status(201).json({
      success: true,
      newQuestion,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getHistoryMasterQyuestionsOnly = async (req, res) => {
  try {
    const questions = await HistoryQuestions.find({
      type: "main",
      mainId: { $ne: null },
    });

    return res.status(200).json(questions);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getHistorySubQyuestionsOnly = async (req, res) => {
  try {
    const questions = await HistoryQuestions.find({
      type: "sub",
      mainId: { $ne: null },
    });

    return res.status(200).json(questions);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get all history questions
export const findAll = async (req, res) => {
  try {
    const { doctorId, templateId, type, status } = req.query;
    const filter = {};

    if (doctorId) filter.doctorId = doctorId;
    if (templateId) filter.templateId = templateId;
    if (type) filter.type = type;
    if (status) filter.status = status;

    const questions = await HistoryQuestions.find(filter);
    return res.status(200).json(questions);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get a single history question by ID
export const findOne = async (req, res) => {
  try {
    const question = await HistoryQuestions.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    return res.status(200).json(question);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update a history question by admin
export const updateHistoryQuestionByAdmin = async (req, res) => {
  try {
    const { qname, inputtype, type, title, mainId, status, templateId } =
      req.body;

    const updatedQuestion = await HistoryQuestions.findByIdAndUpdate(
      req.params.id,
      { qname, inputtype, type, title, mainId, status, templateId },
      { new: true, runValidators: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    return res.status(200).json(updatedQuestion);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update a history question by doctor
export const updateHistoryQuestionByDoctor = async (req, res) => {
  try {
    const { qname, inputtype, type, title, mainId, status, templateId } =
      req.body;
    const doctorId = req.user.id;

    const question = await HistoryQuestions.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    if (question.doctorId.toString() !== doctorId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this question" });
    }

    const updatedQuestion = await HistoryQuestions.findByIdAndUpdate(
      req.params.id,
      { qname, inputtype, type, title, mainId, status, templateId },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      updatedQuestion,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Delete a history question by admin
export const deleteHistoryQuestionByAdmin = async (req, res) => {
  try {
    const deletedQuestion = await HistoryQuestions.findByIdAndDelete(
      req.params.id
    );

    const admin = req.user;
    if (admin.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this question" });
    }

    if (!deletedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    return res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Delete a history question by doctor
export const deleteHistoryQuestionByDoctor = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const question = await HistoryQuestions.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    if (question.doctorId.toString() !== doctorId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this question" });
    }
    2;
    await HistoryQuestions.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getHistoryOptionsByQuestionId = async (req, res) => {
  try {
    const questionId = req.params.questionId;
    console.log("Fetching options for question ID:", questionId);
    const question = await HistoryQuestions.findById(questionId);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const options = await HistoryOption.find({ qId: questionId })
      .populate("doctorId", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json(options);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
