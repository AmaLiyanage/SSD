import Report from "../models/reportModel.js";
import Well from "../models/Well.js";
import fs from "fs";
import path from "path";

export const createReport = async (req, res) => {
  try {
    let { wellId, waterLevel, pumpStatus, severity, description } = req.body;

    wellId = wellId.trim().toUpperCase();

    //Check if well exists
    const well = await Well.findOne({ wellId });

    if (!well) {
      return res.status(404).json({ message: "Well not found" });
    }

    // Check if user already reported this well
    const existingReport = await Report.findOne({
      wellId,
      reportedBy: req.user.id,
    });

    if (existingReport) {
      return res.status(400).json({
        message: "You have already submitted a report for this well",
      });
    }

    const photoFile = req.file ? [req.file.filename] : [];

    const report = await Report.create({
      wellId,
      waterLevel,
      pumpStatus,
      severity,
      description,
      photos: photoFile,
      reportedBy: req.user.id,
    });

    const reportObj = report.toObject();

    reportObj.photos = report.photos.map(photo =>
      `${req.protocol}://${req.get("host")}/uploads/${photo}`
    );

    res.status(201).json(reportObj);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .select("wellId waterLevel pumpStatus severity description photos status reportedBy comments createdAt")
      .populate("reportedBy", "username")
      .populate("comments.commentedBy", "username")
      .sort({ createdAt: -1 });

    const cleanedReports = reports.map(report => {
      return {
        _id: report._id,
        wellId: typeof report.wellId === "object"
          ? report.wellId.wellId   
          : report.wellId,         

        waterLevel: report.waterLevel,
        pumpStatus: report.pumpStatus,
        severity: report.severity,
        description: report.description,
        status: report.status,
        createdAt: report.createdAt,

        photos: report.photos.map(photo =>
          `${req.protocol}://${req.get("host")}/uploads/${photo}`
        ),

        reportedBy: report.reportedBy,

        comments: report.comments.map(comment => ({
          _id: comment._id,
          message: comment.message,
          commentedBy: comment.commentedBy,
          commentedAt: comment.commentedAt
        }))
      };
    });

    res.status(200).json(cleanedReports);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET REPORTS FOR A SPECIFIC WELL (Fixed for ID mismatches)
export const getReportsByWell = async (req, res) => {
  try {
    const { wellId } = req.params;

    // 1. First, check if the ID passed is a MongoDB ObjectID
    // If it is, we find the Well to get its string Identifier (e.g., WELL-001)
    let searchId = wellId;
    const wellDoc = await Well.findById(wellId).catch(() => null);
    
    if (wellDoc) {
      searchId = wellDoc.wellId; // Use "WELL-001" instead of the long hex ID
    }

    // 2. Find reports using the normalized ID
    const reports = await Report.find({ 
      wellId: searchId.trim().toUpperCase() 
    })
      .populate("reportedBy", "username")
      .populate("comments.commentedBy", "username")
      .sort({ createdAt: -1 });

    // 3. If no reports, return 404 so frontend catch block works
    if (!reports || reports.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No reports found for this well",
      });
    }

    // 4. Convert photo filenames to full URLs
    const updatedReports = reports.map(report => {
      const reportObj = report.toObject();

      reportObj.photos = report.photos.map(photo =>
        `${req.protocol}://${req.get("host")}/uploads/${photo}`
      );

      return reportObj;
    });

    res.status(200).json({
      success: true,
      data: updatedReports
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET SINGLE REPORT BY ID
export const getSingleReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate("reportedBy", "username")
      .populate("comments.commentedBy", "username");

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const reportObj = report.toObject();

    reportObj.photos = report.photos.map(photo =>
  `${req.protocol}://${req.get("host")}/uploads/${photo}`
);

res.status(200).json(reportObj);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE REPORT
export const updateReport = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      waterLevel,
      pumpStatus,
      severity,
      description,
      status,
    } = req.body;

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Update fields if provided
    if (waterLevel) report.waterLevel = waterLevel;
    if (pumpStatus) report.pumpStatus = pumpStatus;
    if (severity) report.severity = severity;
    if (description) report.description = description;
    if (status) report.status = status;

   if (req.file) {
   report.photos = [req.file.filename];
}

    await report.save();

const updatedReport = report.toObject();

// Convert filenames to full URLs
updatedReport.photos = report.photos.map(photo =>
  `${req.protocol}://${req.get("host")}/uploads/${photo}`
);

res.status(200).json({
  message: "Report updated successfully",
  report: updatedReport,
});

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// DELETE REPORT BY ID
export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the report
    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    //Delete images from server
    if (report.photos && report.photos.length > 0) {
      report.photos.forEach(photo => {
        const filePath = path.join("uploads", photo);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    // Delete the report from database
    await report.deleteOne();

    res.status(200).json({ message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ADD COMMENT
export const addComment = async (req, res) => {
  try {
    const { message } = req.body;

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    report.comments.push({
      message,
      commentedBy: req.user.id,
    });

    await report.save();

    res.status(201).json({
      message: "Comment added successfully",
      report,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL COMMENTS (from all reports)
export const getAllComments = async (req, res) => {
  try {
    // Get all reports and their comments
    const reports = await Report.find()
      .populate("comments.commentedBy", "username")
      .sort({ createdAt: -1 });

    // Flatten all comments into a single array
    const allComments = reports.flatMap(report =>
      report.comments.map(comment => ({
        commentId: comment._id, 
        reportId: report._id,
        wellId: report.wellId,
        message: comment.message,
        commentedBy: comment.commentedBy.username,
        commentedAt: comment.commentedAt,
      }))
    );

    res.status(200).json(allComments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET COMMENTS FOR A SPECIFIC WELL
export const getWellComments = async (req, res) => {
  try {
    const { wellId } = req.params;

    const reports = await Report.find({ wellId })
      .populate("comments.commentedBy", "username")
      .sort({ createdAt: -1 });

    if (!reports.length) {
      return res.status(404).json({ message: "No reports/comments found for this well" });
    }

    // Flatten comments for this well
    const wellComments = reports.flatMap(report =>
      report.comments.map(comment => ({
        commentId: comment._id, 
        reportId: report._id,
        message: comment.message,
        commentedBy: comment.commentedBy.username,
        commentedAt: comment.commentedAt,
      }))
    );

    res.status(200).json(wellComments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// UPDATE COMMENT - FIXED FOR ROLE-BASED ACCESS
export const updateComment = async (req, res) => {
  try {
    const { reportId, commentId } = req.params;
    const { message } = req.body;

    // 1. Find the report WITHOUT populating the comment author yet
    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // 2. Find the specific comment
    const comment = report.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // 3. AUTHORIZATION logic: Allow ANY admin or field_officer
    const allowedRoles = ["admin", "field_officer"];
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: "Access Denied: You do not have permission to edit logs." 
      });
    }

    // 4. Update and Save
    comment.message = message;
    await report.save();

    res.status(200).json({
      message: "Comment updated successfully",
      comment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE COMMENT
export const deleteComment = async (req, res) => {
  try {
    const { reportId, commentId } = req.params;

    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const comment = report.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // --- NEW AUTHORIZATION LOGIC ---
    const allowedRoles = ["admin", "field_officer"];
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: "Unauthorized: Only Field Officers or Admins can delete comments" 
      });
    }

    // Remove the comment using pull
    report.comments.pull({ _id: commentId });

    await report.save();

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};
 