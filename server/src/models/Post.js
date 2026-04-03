import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        username: {
            type: String,
            required: true,
            trim: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    { _id: false }
);

const commentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        username: {
            type: String,
            required: true,
            trim: true
        },
        text: {
            type: String,
            required: true,
            trim: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    { _id: false }
);

const postSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        username: {
            type: String,
            required: true,
            trim: true
        },
        text: {
            type: String,
            default: '',
            trim: true
        },
        imageUrl: {
            type: String,
            default: '',
            trim: true
        },
        likes: {
            type: [likeSchema],
            default: []
        },
        comments: {
            type: [commentSchema],
            default: []
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model('Post', postSchema);
