const msgBox = document.getElementById('msg');
const tableBody = document.getElementById('donorsTableBody');

function showError(text) {
    msgBox.innerHTML = `<p class="error-msg">${text}</p>`;
}

function clearMsg() {
    msgBox.innerHTML = '';
}

function loadDonors(bloodGroup = '', name = '') {
    clearMsg();
    tableBody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';

    const params = new URLSearchParams();
    if (bloodGroup) params.append('blood_group', bloodGroup);
    if (name) params.append('name', name);

    fetch(`/api/donors?${params.toString()}`, { credentials: 'same-origin' })
        .then(res => {
            if (res.status === 401) {
                window.location.href = 'index.html';
                return null;
            }
            return res.json().then(body => ({ ok: res.ok, body }));
        })
        .then(result => {
            if (!result) return; // redirected to login

            const { ok, body } = result;

            if (!ok) {
                tableBody.innerHTML = '';
                showError(body.error || 'Could not load donors.');
                return;
            }

            const donors = body;
            tableBody.innerHTML = '';

            if (!Array.isArray(donors) || donors.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5">No donors found.</td></tr>';
                return;
            }

            donors.forEach(d => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${d.name}</td>
                    <td>${d.blood_group || '-'}</td>
                    <td>${d.last_donation_date ? String(d.last_donation_date).split('T')[0] : '-'}</td>
                    <td>${d.phone || '-'}</td>
                    <td>${d.address || '-'}</td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(err => {
            tableBody.innerHTML = '';
            showError('Could not load donors. Please try again.');
            console.error(err);
        });
}

document.getElementById('searchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const bloodGroup = document.getElementById('searchBloodGroup').value;
    const name = document.getElementById('searchName').value;
    loadDonors(bloodGroup, name);
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    fetch('/api/logout', { method: 'POST', credentials: 'same-origin' })
        .then(() => window.location.href = 'index.html');
});

loadDonors();
