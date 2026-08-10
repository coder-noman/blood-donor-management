const msgBox = document.getElementById('msg');
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
    })
    .catch(() => {});

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

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    fetch('/api/logout', { method: 'POST' })
        .then(() => window.location.href = 'index.html');
});
