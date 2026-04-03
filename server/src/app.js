import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Post from './models/Post.js';

const app = express();
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(
    cors({
        origin(origin, callback) {
            if (!origin) {
                callback(null, true);
                return;
            }

            if (allowedOrigins.includes(origin)) {
                callback(null, true);
                return;
            }

            callback(new Error('CORS blocked for this origin'));
        }
    })
);
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({
        message: 'API is running',
        uptime: process.uptime()
    });
});

function formatUser(user) {
    return {
        id: user._id ? user._id.toString() : user.id,
        name: user.name,
        email: user.email
    };
}

function formatPost(post) {
    return {
        id: post._id ? post._id.toString() : post.id,
        userId: post.userId.toString ? post.userId.toString() : String(post.userId),
        username: post.username,
        text: post.text || '',
        imageUrl: post.imageUrl || '',
        likes: post.likes.map((like) => ({
            id: `${like.userId.toString ? like.userId.toString() : String(like.userId)}-${new Date(like.createdAt).getTime()}`,
            userId: like.userId.toString ? like.userId.toString() : String(like.userId),
            username: like.username,
            createdAt: like.createdAt
        })),
        comments: post.comments.map((comment) => ({
            id: `${comment.userId.toString ? comment.userId.toString() : String(comment.userId)}-${new Date(comment.createdAt).getTime()}`,
            userId: comment.userId.toString ? comment.userId.toString() : String(comment.userId),
            username: comment.username,
            text: comment.text,
            createdAt: comment.createdAt
        })),
        createdAt: post.createdAt
    };
}



app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const normalizedEmail = String(email || '').trim().toLowerCase();

        if (!name || !normalizedEmail || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required.' });
        }

        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(409).json({ message: 'Email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name: String(name).trim(),
            email: normalizedEmail,
            password: hashedPassword
        });

        return res.status(201).json({ user: formatUser(user) });
    } catch (error) {
        return res.status(500).json({ message: 'Unable to create account.', error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = String(email || '').trim().toLowerCase();

        if (!normalizedEmail || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const passwordMatches = await bcrypt.compare(password, user.password);

        if (!passwordMatches) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        return res.json({ user: formatUser(user) });
    } catch (error) {
        return res.status(500).json({ message: 'Unable to log in.', error: error.message });
    }
});

app.get('/api/posts', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        return res.json({ posts: posts.map(formatPost) });
    } catch (error) {
        return res.status(500).json({ message: 'Unable to load posts.', error: error.message });
    }
});

app.post('/api/posts', async (req, res) => {
    try {
        const { userId, text, imageUrl } = req.body;
        const trimmedText = String(text || '').trim();
        const trimmedImageUrl = String(imageUrl || '').trim();

        if (!userId) {
            return res.status(400).json({ message: 'User is required.' });
        }

        if (!trimmedText && !trimmedImageUrl) {
            return res.status(400).json({ message: 'Text, image, or both are required.' });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const post = await Post.create({
            userId: user._id,
            username: user.name,
            text: trimmedText,
            imageUrl: trimmedImageUrl
        });

        return res.status(201).json({ post: formatPost(post) });
    } catch (error) {
        return res.status(500).json({ message: 'Unable to create post.', error: error.message });
    }
});

app.post('/api/posts/:postId/like', async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'User is required.' });
        }

        const [post, user] = await Promise.all([Post.findById(postId), User.findById(userId)]);

        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const hasLiked = post.likes.some((like) => like.userId.toString() === user._id.toString());

        if (hasLiked) {
            post.likes = post.likes.filter((like) => like.userId.toString() !== user._id.toString());
        } else {
            post.likes.push({
                userId: user._id,
                username: user.name
            });
        }

        await post.save();

        return res.json({ post: formatPost(post) });
    } catch (error) {
        return res.status(500).json({ message: 'Unable to update like.', error: error.message });
    }
});

app.post('/api/posts/:postId/comments', async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId, text } = req.body;
        const trimmedText = String(text || '').trim();

        if (!userId) {
            return res.status(400).json({ message: 'User is required.' });
        }

        if (!trimmedText) {
            return res.status(400).json({ message: 'Comment text is required.' });
        }

        const [post, user] = await Promise.all([Post.findById(postId), User.findById(userId)]);

        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        post.comments.push({
            userId: user._id,
            username: user.name,
            text: trimmedText
        });

        await post.save();

        return res.json({ post: formatPost(post) });
    } catch (error) {
        return res.status(500).json({ message: 'Unable to add comment.', error: error.message });
    }
});

export default app;
