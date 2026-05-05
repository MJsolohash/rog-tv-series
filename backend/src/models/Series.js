const mongoose = require('mongoose');

const seriesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    alternativeName: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        required: true
    },
    coverImage: {
        type: String,
        default: ''
    },
    bannerImage: {
        type: String,
        default: ''
    },
    trailerVideo: {
        type: String,
        default: ''
    },
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    genre: [{
        type: String
    }],
    releaseYear: {
        type: Number,
        required: true
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 10
    },
    totalSeasons: {
        type: Number,
        default: 1
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Series', seriesSchema);