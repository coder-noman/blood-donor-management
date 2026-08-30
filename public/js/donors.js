const tableBody = document.getElementById('donorsTableBody');
const searchBox = document.getElementById('searchBox');
const availableOnlyBox = document.getElementById('availableOnlyBox');
const adminLink = document.getElementById('adminLink');
let allDonors = [];

// Make sure user is logged in, then load donors
fetch('/api/me')
    .then(res => {
        if (res.status === 401) {
            window.location.href = 'index.html';
            throw new Error('Not logged in');
        }
        return res.json();
    })
    .then(user => {
        if (user.is_admin && adminLink) adminLink.style.display = 'inline';
        loadDonors();
    })
    .catch(() => {});

function loadDonors() {
    fetch('/api/donors')
        .then(res => res.json())
        .then(donors => {
            allDonors = donors;
            renderDonors(allDonors);
        });
}

function renderDonors(donors) {
    tableBody.innerHTML = '';
    donors.forEach(d => {
        const row = document.createElement('tr');
        const availableBadge = d.is_available
            ? '<span style="color:#2e7d32; font-weight:bold;">Yes</span>'
            : '<span style="color:#999;">No</span>';

        row.innerHTML = `
            <td>${d.name}</td>
            <td>${d.blood_group || '-'}</td>
            <td>${d.phone || '-'}</td>
            <td>${d.address || '-'}</td>
            <td>${d.last_donation_date ? d.last_donation_date.substring(0,10) : '-'}</td>
            <td>${availableBadge}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Filter by blood group and/or availability
function applyFilters() {
    const term = searchBox.value.trim().toUpperCase();
    const availableOnly = availableOnlyBox.checked;

    let filtered = allDonors;

    if (term) {
        filtered = filtered.filter(d => (d.blood_group || '').toUpperCase().includes(term));
    }
    if (availableOnly) {
        filtered = filtered.filter(d => !!d.is_available);
    }

    renderDonors(filtered);
}

searchBox.addEventListener('input', applyFilters);
availableOnlyBox.addEventListener('change', applyFilters);

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    fetch('/api/logout', { method: 'POST' })
        .then(() => window.location.href = 'index.html');
});
