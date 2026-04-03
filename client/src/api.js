const apiBaseUrl = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
    const response = await fetch(`${apiBaseUrl}${path}`, {
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        },
        ...options
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || 'Request failed.');
    }

    return data;
}

export function signup(payload) {
    return request('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(payload)
    });
}

export function login(payload) {
    return request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload)
    });
}

export function fetchPosts() {
    return request('/api/posts');
}

export function createPost(payload) {
    return request('/api/posts', {
        method: 'POST',
        body: JSON.stringify(payload)
    });
}

export function toggleLike(postId, payload) {
    return request(`/api/posts/${postId}/like`, {
        method: 'POST',
        body: JSON.stringify(payload)
    });
}

export function addComment(postId, payload) {
    return request(`/api/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify(payload)
    });
}
