import { createApplication, updateApplication, getApplicationsByUser, getAllApplications as getApplicationsOfAllUsers } from "../models/financingModel.js";
import { createNotification } from "../models/notificationModel.js";

export const submitApplication = async (req, res) => {
  try {
    const user_id = req.user.id; // comes from JWT middleware
    const { service_name, reason, payment_plan } = req.body;

    const application = await createApplication({ user_id, service_name, reason, payment_plan });
    res.status(201).json({ message: "Application submitted", application });
  } catch (err) {
    console.error("Submit application error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const user_id = req.user.id;

    const applications = await getApplicationsByUser(user_id);
    res.json({ applications });
  } catch (err) {
    console.error("Get applications error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllApplications = async (req, res) => {
  try {
    const applications = await getApplicationsOfAllUsers();
    res.json({ applications: applications });
  } catch (err) {
    console.error("Get all applications error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};  // TO DO duplicate at adminController, delete one of the applications

export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // expected "approved" or "rejected"

    const result = await updateApplication(status, id);

    if (result.length === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    // create notification after updating status
    await createNotification({
      user_id: result[0].user_id,
      message: `Your application for "${result[0].service_name}" was ${status}.`,
    });

    res.json({ message: "Status updated", application: result[0] });
  } catch (err) {
    console.error("Update status error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
