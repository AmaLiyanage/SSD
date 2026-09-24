import mongoose from 'mongoose';

// Monitoring requirements
const WaterQualitySchema = new mongoose.Schema({
    wellId: { type: mongoose.Schema.Types.ObjectId, ref: 'Well', required: true },
    testDate: { type: Date, default: Date.now },
    testerName: { type: String, required: true },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    phLevel: { type: Number, required: true },
    turbidity: { type: Number, required: true },
    bacteriaCount: { type: Number, required: true },
    temperature: { type: Number, required: true }, 
    labReportUrl: { type: String }, // For the field officer reports
    status: { type: String, enum: ['Safe', 'Warning', 'Unsafe'], default: 'Safe' },
    remarks: { type: String }
}, { timestamps: true });

WaterQualitySchema.index({ wellId: 1, testDate: -1 });

export default mongoose.model('WaterQuality', WaterQualitySchema);