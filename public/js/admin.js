const msgBox = document.getElementById('msg');
const tableBody = document.getElementById('usersTableBody');
const editBox = document.getElementById('editBox');
const editForm = document.getElementById('editForm');

fetch('/api/me')
    .then(res => {
        if (res.status === 401) {
            window.location.href = 'index.html';
            throw new Error('Not logged in');
        }
        return res.json();
    })
    .then(user => {
        if (!user.is_admin) {
            window.location.href = 'dashboard.html';
            throw new Error('Not admin');
        }
        loadUsers();
    })
    .catch(() => {});

function loadUsers() {
    fetch('/api/admin/users')
        .then(res => res.json())
        .then(users => {
            tableBody.innerHTML = '';
            users.forEach(u => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${u.id}</td>
                    <td>${u.name}</td>
                    <td>${u.email}</td>
                    <td>${u.age || ''}</td>
                    <td>${u.blood_group || ''}</td>
                    <td>${u.phone || ''}</td>
                    <td>${u.address || ''}</td>
                    <td>${u.last_donation_date ? u.last_donation_date.substring(0,10) : ''}</td>
                    <td>${u.is_admin ? '<span class="admin-tag">Admin</span>' : 'User'}</td>
                    <td>
                        <button class="action-btn edit-btn" onclick='openEdit(${JSON.stringify(u)})'>Edit</button>
                        <button class="action-btn delete-btn" onclick="deleteUser(${u.id})">Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        });
}

function openEdit(user) {
    document.getElementById('editId').value = user.id;
    document.getElementById('editName').value = user.name;
    document.getElementById('editAge').value = user.age || '';
    document.getElementById('editBloodGroup').value = user.blood_group || '';
    document.getElementById('editPhone').value = user.phone || '';
    document.getElementById('editAddress').value = user.address || '';
    document.getElementById('editLastDonation').value = user.last_donation_date ? user.last_donation_date.substring(0,10) : '';

    editBox.style.display = 'block';
    editBox.scrollIntoView({ behavior: 'smooth' });
}

document.getElementById('cancelEditBtn').addEventListener('click', () => {
    editBox.style.display = 'none';
});

editForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = document.getElementById('editId').value;
    const data = {
        name: document.getElementById('editName').value,
        age: document.getElementById('editAge').value,
        blood_group: document.getElementById('editBloodGroup').value,
        phone: document.getElementById('editPhone').value,
        address: document.getElementById('editAddress').value,
        last_donation_date: document.getElementById('editLastDonation').value
    };

    fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(() => {
        editBox.style.display = 'none';
        loadUsers();
    });
});

function deleteUser(id) {
    if (confirm('Are you sure you want to delete this user?')) {
        fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
            .then(() => loadUsers());
    }
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    fetch('/api/logout', { method: 'POST' })
        .then(() => window.location.href = 'index.html');
});
