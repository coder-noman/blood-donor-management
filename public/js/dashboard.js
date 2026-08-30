const msgBox = document.getElementById('msg');
const pwMsgBox = document.getElementById('pwMsg');
const welcomeMsg = document.getElementById('welcomeMsg');
const adminLink = document.getElementById('adminLink');

// Load current user's data
fetch('/api/me')
    .then(res => {
        if (res.status === 401) {
            window.location.href = 'index.html';
            throw new Error('Not logged in');
        }
        return res.json();
    })
    .then(user => {
        welcomeMsg.textContent = `Welcome, ${user.name}`;
        if (user.is_admin) adminLink.style.display = 'inline';

        document.getElementById('name').value = user.name || '';
        document.getElementById('age').value = user.age || '';
        document.getElementById('blood_group').value = user.blood_group || '';
        document.getElementById('phone').value = user.phone || '';
        document.getElementById('address').value = user.address || '';
        document.getElementById('last_donation_date').value =
            user.last_donation_date ? user.last_donation_date.substring(0, 10) : '';

        updateAvailabilityUI(!!user.is_available);
    })
    .catch(() => {});

// ---- Donation availability toggle ----
const availabilityStatus = document.getElementById('availabilityStatus');
const toggleAvailabilityBtn = document.getElementById('toggleAvailabilityBtn');
let currentlyAvailable = false;

function updateAvailabilityUI(isAvailable) {
    currentlyAvailable = isAvailable;
    if (isAvailable) {
        availabilityStatus.textContent = 'You are currently marked as AVAILABLE to donate.';
        availabilityStatus.style.color = '#2e7d32';
        toggleAvailabilityBtn.textContent = 'Mark as Unavailable';
    } else {
        availabilityStatus.textContent = 'You are currently marked as NOT available to donate.';
        availabilityStatus.style.color = '#b71c1c';
        toggleAvailabilityBtn.textContent = 'Mark as Available';
    }
}

toggleAvailabilityBtn.addEventListener('click', () => {
    const newValue = !currentlyAvailable;

    fetch('/api/me/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: newValue })
    })
    .then(res => res.json())
    .then(body => {
        updateAvailabilityUI(body.is_available);
    })
    .catch(() => {
        availabilityStatus.textContent = 'Something went wrong. Please try again.';
        availabilityStatus.style.color = '#b71c1c';
    });
});

// Update profile
document.getElementById('profileForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const data = {
        name: document.getElementById('name').value,
        age: document.getElementById('age').value,
        blood_group: document.getElementById('blood_group').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        last_donation_date: document.getElementById('last_donation_date').value
    };

    fetch('/api/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(body => {
        msgBox.innerHTML = `<p class="success-msg">${body.message || 'Updated'}</p>`;
        welcomeMsg.textContent = `Welcome, ${data.name}`;
    })
    .catch(() => {
        msgBox.innerHTML = `<p class="error-msg">Something went wrong.</p>`;
    });
});

// Change password
document.getElementById('passwordForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const data = {
        current_password: document.getElementById('current_password').value,
        new_password: document.getElementById('new_password').value
    };

    fetch('/api/me/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.json().then(body => ({ status: res.status, body })))
    .then(({ status, body }) => {
        if (status !== 200) {
            pwMsgBox.innerHTML = `<p class="error-msg">${body.error || 'Failed to change password'}</p>`;
            return;
        }
        pwMsgBox.innerHTML = `<p class="success-msg">${body.message}</p>`;
        document.getElementById('passwordForm').reset();
    })
    .catch(() => {
        pwMsgBox.innerHTML = `<p class="error-msg">Something went wrong.</p>`;
    });
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    fetch('/api/logout', { method: 'POST' })
        .then(() => window.location.href = 'index.html');
});
