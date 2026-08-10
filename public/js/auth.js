const msgBox = document.getElementById('msg');

function showError(text) {
    msgBox.innerHTML = `<p class="error-msg">${text}</p>`;
}

function showSuccess(text) {
    msgBox.innerHTML = `<p class="success-msg">${text}</p>`;
}

// ---- Login form ----
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const data = {
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        };

        fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(res => res.json().then(body => ({ status: res.status, body })))
        .then(({ status, body }) => {
            if (status !== 200) {
                showError(body.error || 'Login failed');
                return;
            }
            if (body.is_admin) {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        })
        .catch(() => showError('Something went wrong. Please try again.'));
    });
}

// ---- Register form ----
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const data = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            age: document.getElementById('age').value,
            blood_group: document.getElementById('blood_group').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value
        };

        fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(res => res.json().then(body => ({ status: res.status, body })))
        .then(({ status, body }) => {
            if (status !== 200) {
                showError(body.error || 'Registration failed');
                return;
            }
            showSuccess('Account created! Redirecting to login...');
            setTimeout(() => window.location.href = 'index.html', 1200);
        })
        .catch(() => showError('Something went wrong. Please try again.'));
    });
}
