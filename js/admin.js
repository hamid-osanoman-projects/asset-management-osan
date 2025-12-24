// Admin Dashboard Logic

// Router / Navigation
const router = {
    currentPage: 'employees',

    navigate(page) {
        this.currentPage = page;

        // Update Nav UI
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        const navEl = document.getElementById(`nav-${page}`);
        if (navEl) navEl.classList.add('active');

        // Update View UI
        document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
        document.getElementById(`view-${page}`).classList.remove('hidden');

        // Trigger data load
        if (page === 'employees') dataManager.loadEmployees();
        if (page === 'assets') dataManager.loadAssets();
        if (page === 'add') dataManager.loadEmployeesForSelect(); // Need employees for asset assignment
    }
};

// UI Helpers
const ui = {
    toggleAddTab(tab) {
        const empBtn = document.getElementById('tab-add-employee');
        const assetBtn = document.getElementById('tab-add-asset');
        const empForm = document.getElementById('form-employee');
        const assetForm = document.getElementById('form-asset');

        if (tab === 'employee') {
            empBtn.classList.remove('btn-outline'); document.getElementById('tab-add-employee').style.borderColor = ''; document.getElementById('tab-add-employee').style.color = '';
            empBtn.classList.add('btn'); // Make filled

            // Revert asset button
            assetBtn.classList.remove('btn');
            assetBtn.classList.add('btn-outline');
            assetBtn.style.borderColor = 'transparent';
            assetBtn.style.color = 'var(--text-muted)';

            empBtn.style.color = 'white';

            empForm.classList.remove('hidden');
            assetForm.classList.add('hidden');
        } else {
            // Revert emp button
            empBtn.classList.remove('btn');
            empBtn.classList.add('btn-outline');
            empBtn.style.borderColor = 'transparent';
            empBtn.style.color = 'var(--text-muted)';

            assetBtn.classList.remove('btn-outline');
            assetBtn.classList.add('btn');
            assetBtn.style.borderColor = '';
            assetBtn.style.color = 'white';


            empForm.classList.add('hidden');
            assetForm.classList.remove('hidden');
        }
    },

    renderEmployeeCard(emp) {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <div class="flex justify-between items-center">
                <div>
                    <h3>${emp.name}</h3>
                    <p style="color: var(--text-muted); font-size: 0.9rem;">${emp.department}</p>
                    <p style="font-size: 0.8rem;">${emp.email}</p>
                </div>
                <div id="qr-${emp.id}"></div>
            </div>
            <div class="mt-4 flex gap-2">
                <a href="employee.html?id=${emp.id}" target="_blank" class="btn btn-outline" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">View Public</a>
                <button onclick="dataManager.downloadQR('${emp.id}', '${emp.name}')" class="btn btn-outline" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">Save QR</button>
            </div>
        `;

        // Generate QR
        setTimeout(() => {
            const qrContainer = div.querySelector(`#qr-${emp.id}`);
            // Clear prev
            qrContainer.innerHTML = '';
            // URL
            // URL: Use replace on current HREF to keep the repo path (for GitHub Pages)
            const url = window.location.href.replace('admin.html', 'employee.html').split('#')[0] + `?id=${emp.id}`;
            new QRCode(qrContainer, {
                text: url,
                width: 64,
                height: 64,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.L
            });
        }, 0);

        return div;
    },

    renderAssetCard(asset) {
        const div = document.createElement('div');
        div.className = 'card';
        const colorClass = asset.status === 'Working' ? 'status-working' : (asset.status === 'Repair' ? 'status-repair' : 'status-replaced');

        div.innerHTML = `
            <div class="flex justify-between">
                <h4>${asset.brand} <span style="font-weight: 400; color: var(--text-muted);">(${asset.type})</span></h4>
                <span class="status-badge ${colorClass}">${asset.status}</span>
            </div>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">S/N: ${asset.serial_number}</p>
            <p style="font-size: 0.9rem; margin-top: 8px;">
                Assigned to: <strong>${asset.employees ? asset.employees.name : 'Unassigned'}</strong>
            </p>
        `;
        return div;
    }
};

// Data Manager
const dataManager = {
    async loadEmployees() {
        const list = document.getElementById('employee-list');
        list.innerHTML = '<div class="text-center" style="margin-top: 2rem; color: var(--text-muted);">Loading...</div>';

        const { data, error } = await window.supabaseClient
            .from('employees')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error(error);
            list.innerHTML = `<p class="text-center" style="color:red">Error loading employees</p>`;
            return;
        }

        list.innerHTML = '';
        if (data.length === 0) {
            list.innerHTML = '<p class="text-center text-muted">No employees found.</p>';
            return;
        }

        data.forEach(emp => {
            list.appendChild(ui.renderEmployeeCard(emp));
        });
    },

    async loadAssets() {
        const list = document.getElementById('asset-list');
        list.innerHTML = '<div class="text-center" style="margin-top: 2rem; color: var(--text-muted);">Loading...</div>';

        const { data, error } = await window.supabaseClient
            .from('assets')
            .select('*, employees(name)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error(error);
            list.innerHTML = `<p class="text-center" style="color:red">Error loading assets</p>`;
            return;
        }

        list.innerHTML = '';
        if (data.length === 0) {
            list.innerHTML = '<p class="text-center text-muted">No assets found.</p>';
            return;
        }

        data.forEach(asset => {
            list.appendChild(ui.renderAssetCard(asset));
        });
    },

    async loadEmployeesForSelect() {
        const select = document.getElementById('asset-employee-select');
        // Keep first option
        select.innerHTML = '<option value="">-- Unassigned --</option>';

        const { data, error } = await window.supabaseClient
            .from('employees')
            .select('id, name')
            .order('name');

        if (data) {
            data.forEach(emp => {
                const opt = document.createElement('option');
                opt.value = emp.id;
                opt.textContent = emp.name;
                select.appendChild(opt);
            });
        }
    },

    async createEmployee(e) {
        e.preventDefault();
        const fd = new FormData(e.target);
        const employee = {
            name: fd.get('name'),
            email: fd.get('email'),
            department: fd.get('department')
        };

        const btn = e.target.querySelector('button');
        btn.disabled = true;
        btn.textContent = 'Creating...';

        const { error } = await window.supabaseClient.from('employees').insert([employee]);

        if (error) {
            alert('Error: ' + error.message);
        } else {
            alert('Employee created!');
            e.target.reset();
            router.navigate('employees');
        }
        btn.disabled = false;
        btn.textContent = 'Create Employee';
    },

    async createAsset(e) {
        e.preventDefault();
        const fd = new FormData(e.target);
        const asset = {
            type: fd.get('type'),
            brand: fd.get('brand'),
            serial_number: fd.get('serial_number'),
            status: fd.get('status'),
            employee_id: fd.get('employee_id') || null
        };

        const btn = e.target.querySelector('button');
        btn.disabled = true;
        btn.textContent = 'Adding...';

        const { error } = await window.supabaseClient.from('assets').insert([asset]);

        if (error) {
            alert('Error: ' + error.message);
        } else {
            alert('Asset added!');
            e.target.reset();
            router.navigate('assets');
        }
        btn.disabled = false;
        btn.textContent = 'Add Asset';
    },

    downloadQR(id, name) {
        const div = document.getElementById(`qr-${id}`);
        const img = div.querySelector('img');
        if (img) {
            const link = document.createElement('a');
            link.href = img.src;
            link.download = `QR_${name.replace(/\s+/g, '_')}.png`;
            link.click();
        }
    }
};

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    // Check auth first
    await window.auth.checkSession();

    // Set user info in settings
    const user = await window.auth.getUser();
    if (user) {
        document.getElementById('user-email').textContent = user.email;
        document.getElementById('settings-email').textContent = user.email;
    }

    // Default load
    router.navigate('employees');

    // Forms
    document.getElementById('form-employee').addEventListener('submit', dataManager.createEmployee);
    document.getElementById('form-asset').addEventListener('submit', dataManager.createAsset);

    // Initial Tab State (fix button styles)
    ui.toggleAddTab('employee');
});
