const mongoose = require('mongoose');

const seasonSchema = new mongoose.Schema({
    seriesId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Series',
        required: true
    },
    seasonNumber: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    seasonImage: {
        type: String,
        default: ''
    },
    releaseDate: {
        type: Date,
        default: Date.now
    },
    episodeCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

seasonSchema.index({ seriesId: 1, seasonNumber: 1 }, { unique: true });

module.exports = mongoose.model('Season', seasonSchema);