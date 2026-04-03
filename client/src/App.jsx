import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
    Alert,
    AppBar,
    Avatar,
    Badge,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Chip,
    Container,
    CssBaseline,
    Divider,
    IconButton,
    Paper,
    Stack,
    Tab,
    Tabs,
    TextField,
    ThemeProvider,
    Toolbar,
    Typography,
    createTheme,
    useMediaQuery
} from '@mui/material';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import AddBoxRoundedIcon from '@mui/icons-material/AddBoxRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { addComment, createPost, fetchPosts, login, signup, toggleLike } from './api';

const currentUserStorageKey = 'social-mvp-current-user';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#0f3d8f'
        },
        secondary: {
            main: '#00897b'
        },
        background: {
            default: '#eef3ff',
            paper: '#ffffff'
        }
    },
    shape: {
        borderRadius: 14
    },
    typography: {
        fontFamily: "'Segoe UI', 'Inter', sans-serif",
        h4: { fontWeight: 700 },
        h5: { fontWeight: 700 },
        button: { textTransform: 'none', fontWeight: 600 }
    }
});

function readStoredUser() {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        return JSON.parse(window.localStorage.getItem(currentUserStorageKey) || 'null');
    } catch {
        return null;
    }
}

function TopNavigation({ currentUser, postsCount, onLogout }) {
    const location = useLocation();
    const navigate = useNavigate();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const routes = [
        { path: '/signup', label: 'Signup', icon: <PersonAddRoundedIcon fontSize="small" /> },
        { path: '/login', label: 'Login', icon: <LoginRoundedIcon fontSize="small" /> },
        { path: '/feed', label: 'Feed', icon: <HomeRoundedIcon fontSize="small" /> }
    ];

    const currentTab = routes.findIndex((route) => route.path === location.pathname);

    return (
        <AppBar
            position="sticky"
            color="inherit"
            elevation={0}
            sx={{ borderBottom: '1px solid', borderColor: 'divider', backdropFilter: 'blur(6px)' }}
        >
            <Toolbar sx={{ py: 1, minHeight: 72 }}>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flexGrow: 1 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                        <AutoAwesomeRoundedIcon fontSize="small" />
                    </Avatar>
                    <Box>
                        <Typography variant="h6" sx={{ lineHeight: 1.1 }}>
                            TaskPlanet Social
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Fast social flow, clean and focused
                        </Typography>
                    </Box>
                </Stack>

                {!isMobile ? (
                    <Tabs value={currentTab >= 0 ? currentTab : false} onChange={(event, index) => navigate(routes[index].path)}>
                        {routes.map((route) => (
                            <Tab
                                key={route.path}
                                icon={route.icon}
                                iconPosition="start"
                                label={route.label}
                                sx={{ minHeight: 40 }}
                            />
                        ))}
                    </Tabs>
                ) : null}

                <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: 2 }}>
                    <Chip
                        color={currentUser ? 'secondary' : 'default'}
                        variant={currentUser ? 'filled' : 'outlined'}
                        size="small"
                        label={currentUser ? currentUser.name : 'Guest'}
                    />
                    <Badge badgeContent={postsCount} color="primary">
                        <AddBoxRoundedIcon color="action" fontSize="small" />
                    </Badge>
                    {currentUser ? (
                        <IconButton size="small" onClick={onLogout}>
                            <LogoutRoundedIcon fontSize="small" />
                        </IconButton>
                    ) : null}
                </Stack>
            </Toolbar>

            {isMobile ? (
                <Tabs
                    value={currentTab >= 0 ? currentTab : false}
                    onChange={(event, index) => navigate(routes[index].path)}
                    variant="fullWidth"
                    sx={{ px: 1 }}
                >
                    {routes.map((route) => (
                        <Tab key={route.path} icon={route.icon} label={route.label} sx={{ minHeight: 52 }} />
                    ))}
                </Tabs>
            ) : null}
        </AppBar>
    );
}

function AuthCard({ title, subtitle, icon, children }) {
    return (
        <Container maxWidth="sm" sx={{ py: { xs: 2.5, md: 4 } }}>
            <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: '1px solid', borderColor: 'divider', borderRadius: 4 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 34, height: 34 }}>{icon}</Avatar>
                    <Box>
                        <Typography variant="h5">{title}</Typography>
                        <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
                    </Box>
                </Stack>
                {children}
            </Paper>
        </Container>
    );
}

function SignupPage({ onSignupSuccess, showNotice }) {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        const payload = {
            name: form.name.trim(),
            email: form.email.trim().toLowerCase(),
            password: form.password.trim()
        };

        if (!payload.name || !payload.email || !payload.password) {
            showNotice('error', 'Please fill name, email, and password.');
            return;
        }

        setSubmitting(true);
        try {
            await signup(payload);
            onSignupSuccess();
            showNotice('success', 'Account created. Login to continue.');
            navigate('/login');
        } catch (error) {
            showNotice('error', error.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AuthCard title="Create account" subtitle="Join and start posting" icon={<PersonAddRoundedIcon fontSize="small" />}>
            <Stack component="form" spacing={2} onSubmit={handleSubmit}>
                <TextField label="Full name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} fullWidth />
                <TextField label="Email" type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} fullWidth />
                <TextField label="Password" type="password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} fullWidth />
                <Button type="submit" variant="contained" size="large" disabled={submitting}>
                    {submitting ? 'Creating account...' : 'Create account'}
                </Button>
            </Stack>
        </AuthCard>
    );
}

function LoginPage({ onLoginSuccess, showNotice }) {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        const payload = {
            email: form.email.trim().toLowerCase(),
            password: form.password.trim()
        };

        if (!payload.email || !payload.password) {
            showNotice('error', 'Please fill email and password.');
            return;
        }

        setSubmitting(true);
        try {
            const data = await login(payload);
            onLoginSuccess(data.user);
            showNotice('success', `Welcome back, ${data.user.name}.`);
            navigate('/feed');
        } catch (error) {
            showNotice('error', error.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AuthCard title="Login" subtitle="Continue where you left off" icon={<LoginRoundedIcon fontSize="small" />}>
            <Stack component="form" spacing={2} onSubmit={handleSubmit}>
                <TextField label="Email" type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} fullWidth />
                <TextField label="Password" type="password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} fullWidth />
                <Button type="submit" variant="contained" size="large" disabled={submitting}>
                    {submitting ? 'Logging in...' : 'Login'}
                </Button>
            </Stack>
        </AuthCard>
    );
}

function FeedComposer({ currentUser, onCreatePost, showNotice }) {
    const [form, setForm] = useState({ text: '', imageUrl: '' });
    const [publishing, setPublishing] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        if (!currentUser) {
            showNotice('error', 'Please login to create a post.');
            return;
        }

        const payload = {
            userId: currentUser.id,
            text: form.text.trim(),
            imageUrl: form.imageUrl.trim()
        };

        if (!payload.text && !payload.imageUrl) {
            showNotice('error', 'Write something or add an image URL.');
            return;
        }

        setPublishing(true);
        try {
            await onCreatePost(payload);
            setForm({ text: '', imageUrl: '' });
            showNotice('success', 'Post published.');
        } catch (error) {
            showNotice('error', error.message);
        } finally {
            setPublishing(false);
        }
    }

    return (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 4, p: { xs: 2, md: 2.5 } }}>
            <Stack component="form" spacing={1.5} onSubmit={handleSubmit}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: currentUser ? 'secondary.main' : 'grey.400' }}>
                        {currentUser ? currentUser.name.charAt(0).toUpperCase() : 'G'}
                    </Avatar>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {currentUser ? 'Create a new post' : 'Login to create a post'}
                    </Typography>
                </Stack>
                <TextField
                    placeholder="Share an update with your network"
                    multiline
                    minRows={3}
                    value={form.text}
                    onChange={(e) => setForm((prev) => ({ ...prev, text: e.target.value }))}
                    disabled={!currentUser || publishing}
                    fullWidth
                />
                <TextField
                    placeholder="Image URL (optional)"
                    type="url"
                    value={form.imageUrl}
                    onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                    disabled={!currentUser || publishing}
                    fullWidth
                />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                        Keep it short and clear for better engagement
                    </Typography>
                    <Button type="submit" variant="contained" endIcon={<SendRoundedIcon />} disabled={!currentUser || publishing}>
                        {publishing ? 'Publishing...' : 'Publish'}
                    </Button>
                </Stack>
            </Stack>
        </Paper>
    );
}

function FeedPage({ currentUser, posts, loadingPosts, commentDrafts, onCommentDraft, onLike, onComment, onCreatePost, showNotice }) {
    return (
        <Container maxWidth="md" sx={{ py: { xs: 2, md: 3 }, pb: { xs: 5, md: 4 } }}>
            <Stack spacing={2}>
                <Paper
                    elevation={0}
                    sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 4,
                        p: { xs: 2, md: 2.5 },
                        background: 'linear-gradient(135deg, #ffffff 0%, #f4f8ff 100%)'
                    }}
                >
                    <Typography variant="h5">Your Feed</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Discover updates, share thoughts, and stay connected.
                    </Typography>
                </Paper>

                <FeedComposer currentUser={currentUser} onCreatePost={onCreatePost} showNotice={showNotice} />

                {loadingPosts ? (
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                        <Typography>Loading feed...</Typography>
                    </Paper>
                ) : null}

                {!loadingPosts && posts.length === 0 ? (
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                        <Typography>No posts yet. Be the first to share something.</Typography>
                    </Paper>
                ) : null}

                {!loadingPosts
                    ? posts.map((post) => (
                        <Card key={post.id} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 4 }}>
                            <CardContent sx={{ pb: 1.5 }}>
                                <Stack spacing={1.5}>
                                    <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
                                        <Stack direction="row" spacing={1.25} alignItems="center">
                                            <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                                                {post.username.charAt(0).toUpperCase()}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                                    {post.username}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(post.createdAt).toLocaleString()}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                        <Chip size="small" label={`${post.likes.length} likes`} />
                                    </Stack>

                                    {post.text ? <Typography variant="body1">{post.text}</Typography> : null}
                                    {post.imageUrl ? (
                                        <Box
                                            component="img"
                                            src={post.imageUrl}
                                            alt="post"
                                            sx={{ width: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider', maxHeight: 460, objectFit: 'cover' }}
                                        />
                                    ) : null}
                                </Stack>
                            </CardContent>

                            <CardActions sx={{ px: 2, pt: 0, justifyContent: 'space-between' }}>
                                <Stack direction="row" spacing={1}>
                                    <Button startIcon={<FavoriteBorderRoundedIcon />} variant="text" onClick={() => onLike(post.id)} disabled={!currentUser}>
                                        Like
                                    </Button>
                                    <Button startIcon={<ChatBubbleOutlineRoundedIcon />} variant="text" disabled>
                                        {post.comments.length} Comments
                                    </Button>
                                </Stack>
                            </CardActions>

                            <Divider />

                            <Box sx={{ px: 2, py: 1.5 }}>
                                <Stack spacing={1.2}>
                                    {post.comments.map((comment) => (
                                        <Box key={comment.id} sx={{ backgroundColor: '#f6f8fb', borderRadius: 2, px: 1.25, py: 1 }}>
                                            <Typography variant="subtitle2">{comment.username}</Typography>
                                            <Typography variant="body2">{comment.text}</Typography>
                                        </Box>
                                    ))}

                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                                        <TextField
                                            size="small"
                                            placeholder={currentUser ? 'Write a comment' : 'Login to comment'}
                                            value={commentDrafts[post.id] || ''}
                                            onChange={(e) => onCommentDraft(post.id, e.target.value)}
                                            disabled={!currentUser}
                                            fullWidth
                                        />
                                        <Button variant="contained" endIcon={<SendRoundedIcon />} onClick={() => onComment(post.id)} disabled={!currentUser}>
                                            Post
                                        </Button>
                                    </Stack>
                                </Stack>
                            </Box>
                        </Card>
                    ))
                    : null}
            </Stack>
        </Container>
    );
}

function RequireAuth({ currentUser, children }) {
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default function App() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(readStoredUser);
    const [posts, setPosts] = useState([]);
    const [commentDrafts, setCommentDrafts] = useState({});
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [hasSignedUp, setHasSignedUp] = useState(false);
    const [notice, setNotice] = useState({ type: 'info', message: 'Create an account or login to begin.' });

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        if (currentUser) {
            window.localStorage.setItem(currentUserStorageKey, JSON.stringify(currentUser));
        } else {
            window.localStorage.removeItem(currentUserStorageKey);
        }
    }, [currentUser]);

    useEffect(() => {
        async function loadFeed() {
            try {
                const data = await fetchPosts();
                setPosts(data.posts || []);
            } catch (error) {
                setNotice({ type: 'error', message: error.message });
            } finally {
                setLoadingPosts(false);
            }
        }

        void loadFeed();
    }, []);

    const noticeSeverity = notice.type === 'error' ? 'error' : notice.type === 'success' ? 'success' : 'info';

    const stepChips = useMemo(
        () => [
            { label: 'Signup', done: hasSignedUp || Boolean(currentUser) },
            { label: 'Login', done: Boolean(currentUser) },
            { label: 'Feed', done: posts.length > 0 }
        ],
        [currentUser, hasSignedUp, posts.length]
    );

    function showNotice(type, message) {
        setNotice({ type, message });
    }

    async function handleCreatePost(payload) {
        const data = await createPost(payload);
        setPosts((prev) => [data.post, ...prev]);
    }

    async function handleLike(postId) {
        try {
            const data = await toggleLike(postId, { userId: currentUser.id });
            setPosts((prev) => prev.map((post) => (post.id === postId ? data.post : post)));
        } catch (error) {
            showNotice('error', error.message);
        }
    }

    async function handleComment(postId) {
        const text = String(commentDrafts[postId] || '').trim();

        if (!text) {
            showNotice('error', 'Write a comment first.');
            return;
        }

        try {
            const data = await addComment(postId, { userId: currentUser.id, text });
            setPosts((prev) => prev.map((post) => (post.id === postId ? data.post : post)));
            setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
        } catch (error) {
            showNotice('error', error.message);
        }
    }

    function handleLogout() {
        setCurrentUser(null);
        showNotice('info', 'Logged out successfully.');
        navigate('/login');
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ minHeight: '100vh', background: 'radial-gradient(circle at 10% 10%, #dfe8ff 0%, #eef3ff 36%, #f7f9ff 100%)' }}>
                <TopNavigation currentUser={currentUser} postsCount={posts.length} onLogout={handleLogout} />

                <Container maxWidth="md" sx={{ pt: 2 }}>
                    <Paper elevation={0} sx={{ p: 1.25, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                            {stepChips.map((step) => (
                                <Chip key={step.label} size="small" color={step.done ? 'success' : 'default'} label={step.label} />
                            ))}
                        </Stack>
                    </Paper>
                </Container>

                <Container maxWidth="md" sx={{ pt: 2 }}>
                    <Alert severity={noticeSeverity}>{notice.message}</Alert>
                </Container>

                <Routes>
                    <Route path="/" element={<Navigate to={currentUser ? '/feed' : '/signup'} replace />} />
                    <Route path="/signup" element={<SignupPage onSignupSuccess={() => setHasSignedUp(true)} showNotice={showNotice} />} />
                    <Route path="/login" element={<LoginPage onLoginSuccess={(user) => setCurrentUser(user)} showNotice={showNotice} />} />
                    <Route
                        path="/feed"
                        element={
                            <FeedPage
                                currentUser={currentUser}
                                posts={posts}
                                loadingPosts={loadingPosts}
                                commentDrafts={commentDrafts}
                                onCreatePost={handleCreatePost}
                                onCommentDraft={(postId, value) => setCommentDrafts((prev) => ({ ...prev, [postId]: value }))}
                                onLike={handleLike}
                                onComment={handleComment}
                                showNotice={showNotice}
                            />
                        }
                    />
                    <Route path="/create" element={<RequireAuth currentUser={currentUser}><Navigate to="/feed" replace /></RequireAuth>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Box>
        </ThemeProvider>
    );
}
