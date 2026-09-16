import Well from "../models/Well.js";


// Helper Function - Normalize wellId

const normalizeWellId = (inputId) => {
  const wellId = inputId.trim().toUpperCase();

  const match = wellId.match(/^([A-Z]+)-(\d+)$/);

  if (!match) return null;

  const prefix = match[1];
  const number = match[2].padStart(3, "0");

  return `${prefix}-${number}`;
};


// Create Well (Admin)

export const createWell = async (req, res) => {
  try {
    let { wellId, name, village, lat, lng, depth, type } = req.body;

    if (!wellId || !name || !village || lat == null || lng == null || !depth || !type) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Normalize wellId
    const formattedWellId = normalizeWellId(wellId);

    if (!formattedWellId) {
      return res.status(400).json({
        message: "Invalid wellId format. Use format like WELL-001",
      });
    }

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        message: "Latitude and Longitude must be numbers",
      });
    }

    if (depth <= 0) {
      return res.status(400).json({
        message: "Depth must be greater than 0",
      });
    }

    // Check duplicate
    const existingWell = await Well.findOne({ wellId: formattedWellId });
    if (existingWell) {
      return res.status(400).json({
        message: "Well ID already exists",
      });
    }

    const well = await Well.create({
      wellId: formattedWellId,
      name: name.trim(),
      village: village.trim(),
      depth,
      type,
      location: {
        type: "Point",
        coordinates: [Number(lng), Number(lat)],
      },
    });

    res.status(201).json({
      success: true,
      message: "Well created successfully",
      data: well,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




// Get All Wells

export const getAllWells = async (req, res) => {
  try {
    const { village, status } = req.query;

    const query = { isArchived: false };

    if (village) query.village = village;
    if (status) query.status = status;

    const wells = await Well.find(query);

    res.status(200).json({
      success: true,
      count: wells.length,
      data: wells,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




// Get Well by Mongo _id

export const getWellById = async (req, res) => {
  try {
    const well = await Well.findById(req.params.id);

    if (!well) {
      return res.status(404).json({ message: "Well not found" });
    }

    res.status(200).json({
      success: true,
      data: well,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Get Well by wellId

export const getWellByWellId = async (req, res) => {
  try {
    const formattedWellId = normalizeWellId(req.params.wellId);

    if (!formattedWellId) {
      return res.status(400).json({
        message: "Invalid wellId format",
      });
    }

    const well = await Well.findOne({ wellId: formattedWellId });

    if (!well) {
      return res.status(404).json({ message: "Well not found" });
    }

    res.status(200).json({
      success: true,
      data: well,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




// Update Well Metadata

export const updateWell = async (req, res) => {
  try {
    const { name, village, depth, type } = req.body;

    const updateData = {};

    if (name) updateData.name = name.trim();
    if (village) updateData.village = village.trim();
    if (depth) {
      if (depth <= 0) {
        return res.status(400).json({
          message: "Depth must be greater than 0",
        });
      }
      updateData.depth = depth;
    }
    if (type) updateData.type = type;

    const well = await Well.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: "after" }
    );

    if (!well) {
      return res.status(404).json({ message: "Well not found" });
    }

    res.status(200).json({
      success: true,
      message: "Well updated successfully",
      data: well,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




// Update Well Status

export const updateWellStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Active", "Dry", "Maintenance"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }

    const well = await Well.findByIdAndUpdate(
      req.params.id,
      { status },
      { returnDocument: "after" }
    );

    if (!well) {
      return res.status(404).json({ message: "Well not found" });
    }

    res.status(200).json({
      success: true,
      message: "Well status updated successfully",
      data: well,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Hard Delete Well

export const deleteWell = async (req, res) => {
  try {
    const well = await Well.findByIdAndDelete(req.params.id);

    if (!well) {
      return res.status(404).json({ message: "Well not found" });
    }

    res.status(200).json({
      success: true,
      message: "Well deleted permanently",
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};