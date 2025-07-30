// controllers/subscriptionController.js

import Subscriptions from "../models/Subscriptions.js";

// Create subscription
export const createSubscription = async (req, res) => {
  try {
    const { planName, price, startDate, endDate } = req.body;

    const subscription = new Subscriptions({
      planName,
      price,
      startDate,
      endDate,
    });

    const saved = await subscription.save();
    res.status(201).json({
      success: true,
      message: "Subscription created successfully",
    });
  } catch (error) {
    console.error("Create error:", error);
    res.status(500).json({ message: "Failed to create subscription" });
  }
};

// Get all subscriptions
export const getAllSubscriptions = async (req, res) => {
  try {
    const { forDoctors } = req.query;

    console.log("Fetching subscriptions with filter:", typeof forDoctors);

    let filter = {};

    if (forDoctors === "true") {
      const today = new Date();

      // Only include active (non-expired) subscriptions
      filter = {
        startDate: { $lte: today },
        endDate: { $gte: today },
      };
    }

    const subscriptions = await Subscriptions.find(filter).sort({
      createdAt: -1,
    });

    res.status(200).json(subscriptions);
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).json({ message: "Failed to fetch subscriptions" });
  }
};

// Get one subscription by ID
export const getSubscriptionById = async (req, res) => {
  try {
    const subscription = await Subscriptions.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }
    res.status(200).json(subscription);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving subscription" });
  }
};

// Update subscription
export const updateSubscription = async (req, res) => {
  try {
    const updated = await Subscriptions.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update subscription" });
  }
};

// Delete subscription
export const deleteSubscription = async (req, res) => {
  try {
    const deleted = await Subscriptions.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Subscription not found" });
    }
    res.status(200).json({ message: "Subscription deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete subscription" });
  }
};
