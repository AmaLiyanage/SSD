
import WaterQuality from '../models/WaterQuality.js';
import mongoose from 'mongoose';


const waterQualityDTO = (test) => ({
    id: test._id,
    wellId: test.wellId,
    testDate: test.testDate,
    testerName: test.testerName,
    phLevel: test.phLevel,
    turbidity: test.turbidity,
    bacteriaCount: test.bacteriaCount,
    temperature: test.temperature,
    labReportUrl: test.labReportUrl,
    status: test.status,
    remarks: test.remarks
});


const validatePayload = (payload, isPartial = false) => {
    const errors = [];

    if (!isPartial || payload.wellId !== undefined) {
        if (!payload.wellId || !mongoose.Types.ObjectId.isValid(payload.wellId)) {
            errors.push('wellId must be a valid ObjectId');
        }
    }

    if (!isPartial || payload.testerName !== undefined) {
        if (!payload.testerName || typeof payload.testerName !== 'string' || !payload.testerName.trim()) {
            errors.push('testerName is required');
        }
    }

    if (!isPartial || payload.phLevel !== undefined) {
        if (typeof payload.phLevel !== 'number' || payload.phLevel < 0 || payload.phLevel > 14) {
            errors.push('phLevel must be a number between 0 and 14');
        }
    }

    if (!isPartial || payload.turbidity !== undefined) {
        if (typeof payload.turbidity !== 'number' || payload.turbidity < 0) {
            errors.push('turbidity must be a non-negative number');
        }
    }

    if (!isPartial || payload.bacteriaCount !== undefined) {
        if (typeof payload.bacteriaCount !== 'number' || payload.bacteriaCount < 0) {
            errors.push('bacteriaCount must be a non-negative number');
        }
    }

    if (!isPartial || payload.temperature !== undefined) {
        if (typeof payload.temperature !== 'number' || payload.temperature < -20 || payload.temperature > 100) {
            errors.push('temperature must be a number between -20 and 100');
        }
    }

    if (payload.testDate !== undefined && payload.testDate !== null && payload.testDate !== "") {
        const d = new Date(payload.testDate);
        if (isNaN(d.getTime())) {
            errors.push('testDate must be a valid date');
        }
    }

    return errors;
};

const computeTestStatus = ({ phLevel, bacteriaCount, turbidity, temperature }) => {
    let status = 'Safe';
    if (phLevel < 6.5 || phLevel > 8.5 || bacteriaCount > 0 || turbidity > 5.0 || temperature > 35) {
        status = 'Unsafe';
    } else if (phLevel < 6.8 || phLevel > 8.2 || turbidity > 4.0 || temperature > 30) {
        status = 'Warning';
    }
    return status;
};

// 1. Requirement: Record Test Result 
export const addTestResult = async (req, res) => {
    try {
        const errors = validatePayload(req.body, false);

        if (errors.length) {
            return res.status(400).json({
                message: "Validation Error",
                errors
            });
        }

        const {
            wellId,
            testerName,
            testDate,
            phLevel,
            turbidity,
            bacteriaCount,
            temperature,
            labReportUrl,
            remarks
        } = req.body;

        const status = computeTestStatus({
            phLevel: Number(phLevel),
            bacteriaCount: Number(bacteriaCount),
            turbidity: Number(turbidity),
            temperature: Number(temperature)
        });

        const newTest = new WaterQuality({
            wellId,
            testerName,
            testDate,
            phLevel,
            turbidity,
            bacteriaCount,
            temperature,
            labReportUrl,
            remarks,

            // Server-controlled fields
            status,
            createdBy: req.user._id
        });

        const savedTest = await newTest.save();

        const populatedTest = await WaterQuality.findById(savedTest._id)
            .populate(
                'wellId',
                'wellId name village location type depth'
            );

        //res.status(201).json(populatedTest);
        res.status(201).json(waterQualityDTO(populatedTest));

    } catch (err) {
        res.status(400).json({
            message: "Validation Error",
            error: err.message
        });
    }
};

// 2. Get All Test Results
// export const getAllTests = async (req, res) => {
//     try {
//         const tests = await WaterQuality.find()
//             .populate('wellId', 'wellId name village location type depth')
//             .sort({ testDate: -1, createdAt: -1 });
//         res.status(200).json(tests);
//     } catch (err) {
//         res.status(500).json({ message: "Fetch Error", error: err.message });
//     }
// };

export const getAllTests = async (req, res) => {
    try {
        const tests = await WaterQuality.find()
            .populate('wellId', 'wellId name village location type depth')
            .sort({ testDate: -1, createdAt: -1 });

        const safeTests = tests.map(waterQualityDTO);

        res.status(200).json(safeTests);
    } catch (err) {
        res.status(500).json({
            message: "Fetch Error",
            error: err.message
        });
    }
};
//Now the API doesn't automatically expose every field in the Mongoose document.



// 3. Get a Single Test by ID
export const getTestById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Validation Error", error: "Invalid id" });
        }

        const test = await WaterQuality.findById(req.params.id)
            .populate('wellId', 'wellId name village location type depth');
        if (!test) {
            return res.status(404).json({ message: "Test not found" });
        }

       // res.status(200).json(test);
       res.status(200).json(waterQualityDTO(test));
    } catch (err) {
        res.status(500).json({ message: "Fetch Error", error: err.message });
    }
};

// 4. Get History for a Specific Well
export const getWellHistory = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.wellId)) {
            return res.status(400).json({ message: "Validation Error", error: "Invalid wellId" });
        }

        const history = await WaterQuality.find({ wellId: req.params.wellId })
            .populate('wellId', 'wellId name village location type depth')
            .sort({ testDate: -1, createdAt: -1 });
        
        //    res.status(200).json(history);
        const safeHistory = history.map(waterQualityDTO);

        res.status(200).json(safeHistory);


    } catch (err) {
        res.status(500).json({ message: "Fetch Error", error: err.message });
    }
};

// 5. Update a Test Result
export const updateTestResult = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Validation Error",
                error: "Invalid id"
            });
        }

        const errors = validatePayload(req.body, true);

        if (errors.length) {
            return res.status(400).json({
                message: "Validation Error",
                errors
            });
        }

        // Find the report
        const existingTest = await WaterQuality.findById(req.params.id);

        if (!existingTest) {
            return res.status(404).json({
                message: "Record not found"
            });
        }

        // Object-level authorization
        // Admin can modify any report.
        // Lab tester can modify only their own report.
        if (
            req.user.role !== 'admin' &&
            existingTest.createdBy.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                message: "You are not authorized to modify this report"
            });
        }

        // Allow-list: only these fields can be updated
        const allowedFields = [
            'wellId',
            'testerName',
            'testDate',
            'phLevel',
            'turbidity',
            'bacteriaCount',
            'temperature',
            'labReportUrl',
            'remarks'
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        // Calculate status on the server
        const statusData = {
            phLevel: updates.phLevel !== undefined
                ? Number(updates.phLevel)
                : existingTest.phLevel,

            bacteriaCount: updates.bacteriaCount !== undefined
                ? Number(updates.bacteriaCount)
                : existingTest.bacteriaCount,

            turbidity: updates.turbidity !== undefined
                ? Number(updates.turbidity)
                : existingTest.turbidity,

            temperature: updates.temperature !== undefined
                ? Number(updates.temperature)
                : existingTest.temperature
        };

        updates.status = computeTestStatus(statusData);

        // Update only allow-listed fields
        const updated = await WaterQuality.findByIdAndUpdate(
            req.params.id,
            updates,
            {
                new: true,
                runValidators: true
            }
        ).populate(
            'wellId',
            'wellId name village location type depth'
        );

        //res.status(200).json(updated);
        res.status(200).json(waterQualityDTO(updated));

    } catch (err) {
        res.status(400).json({
            message: "Update Error",
            error: err.message
        });
    }
};

// export const deleteTestResult = async (req, res) => {
//     try {
//         if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//             return res.status(400).json({ message: "Validation Error", error: "Invalid id" });
//         }

//         const deleted = await WaterQuality.findByIdAndDelete(req.params.id);
//         if (!deleted) {
//             return res.status(404).json({ message: "Record not found" });
//         }
//         res.status(200).json({ message: "Record deleted successfully" });
//     } catch (err) {
//         res.status(500).json({ message: "Delete failed", error: err.message });
//     }

// };

export const deleteTestResult = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Validation Error",
                error: "Invalid id"
            });
        }

        const existingTest = await WaterQuality.findById(req.params.id);

        if (!existingTest) {
            return res.status(404).json({
                message: "Record not found"
            });
        }

        // Admin can delete any report.
        // Lab tester can delete only their own report.
        if (
            req.user.role !== 'admin' &&
            existingTest.createdBy.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                message: "You are not authorized to delete this report"
            });
        }

        await WaterQuality.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Record deleted successfully"
        });

    } catch (err) {
        res.status(500).json({
            message: "Delete failed",
            error: err.message
        });
    }
};
