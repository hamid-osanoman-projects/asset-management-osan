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

    // Modal Helpers
    openModal(title, fields, onSave) {
        document.getElementById('modal-title').textContent = title;
        const container = document.getElementById('modal-fields');
        container.innerHTML = fields;

        document.getElementById('edit-modal').classList.remove('hidden');

        // Handle form submission
        const form = document.getElementById('edit-form');
        form.onsubmit = async (e) => {
            e.preventDefault();
            await onSave(new FormData(form));
            this.closeModal();
        }
    },

    closeModal() {
        document.getElementById('edit-modal').classList.add('hidden');
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
            <div class="mt-4 flex justify-between items-center">
                <div class="flex gap-2">
                    <a href="employee.html?id=${emp.id}" target="_blank" class="btn btn-outline" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">View Public</a>
                    <button onclick="dataManager.downloadQR('${emp.id}', '${emp.name}')" class="btn btn-outline" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">Save QR</button>
                </div>
                <div class="flex gap-2">
                    <button onclick="dataManager.openEditEmployee('${emp.id}')" class="btn btn-outline" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">Edit</button>
                    <button onclick="dataManager.deleteEmployee('${emp.id}')" class="btn btn-danger" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">Delete</button>
                </div>
            </div>
        `;

        // Generate QR
        setTimeout(() => {
            const qrContainer = div.querySelector(`#qr-${emp.id}`);
            // Clear prev
            qrContainer.innerHTML = '';
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
        const connectivityBadge = asset.connectivity ? `<span style="font-size: 0.7rem; background: #eee; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">${asset.connectivity}</span>` : '';

        div.innerHTML = `
            <div class="flex justify-between">
                <h4>${asset.brand} <span style="font-weight: 400; color: var(--text-muted);">(${asset.type})</span> ${connectivityBadge}</h4>
                <span class="status-badge ${colorClass}">${asset.status}</span>
            </div>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">S/N: ${asset.serial_number}</p>
            <p style="font-size: 0.9rem; margin-top: 8px;">
                Assigned to: <strong>${asset.employees ? asset.employees.name : 'Unassigned'}</strong>
            </p>
            <div class="mt-4 text-right flex justify-end gap-2">
                <button onclick="dataManager.openEditAsset('${asset.id}')" class="btn btn-outline" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">Edit</button>
                <button onclick="dataManager.deleteAsset('${asset.id}')" class="btn btn-danger" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">Delete</button>
            </div>
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
            connectivity: fd.get('connectivity'), // Add connectivity
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

    async deleteEmployee(id) {
        if (!confirm('Are you sure you want to delete this employee? This will also unassign their assets.')) return;

        const { error } = await window.supabaseClient
            .from('employees')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Error deleting: ' + error.message);
        } else {
            this.loadEmployees();
        }
    },

    async deleteAsset(id) {
        if (!confirm('Are you sure you want to delete this asset?')) return;

        const { error } = await window.supabaseClient
            .from('assets')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Error deleting: ' + error.message);
        } else {
            this.loadAssets();
        }
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
    },

    // Edit Logic
    async openEditEmployee(id) {
        const { data: emp } = await window.supabaseClient.from('employees').select('*').eq('id', id).single();
        if (!emp) return;

        const fields = `
            <div class="input-group">
                <label class="input-label">Full Name</label>
                <input type="text" name="name" class="input-field" value="${emp.name}" required>
            </div>
            <div class="input-group">
                <label class="input-label">Email</label>
                <input type="email" name="email" class="input-field" value="${emp.email}" required>
            </div>
            <div class="input-group">
                <label class="input-label">Department</label>
                <input type="text" name="department" class="input-field" value="${emp.department}" required>
            </div>
        `;

        ui.openModal('Edit Employee', fields, async (fd) => {
            await this.updateEmployee(id, {
                name: fd.get('name'),
                email: fd.get('email'),
                department: fd.get('department')
            });
        });
    },

    async updateEmployee(id, updates) {
        const { error } = await window.supabaseClient.from('employees').update(updates).eq('id', id);
        if (error) alert('Error updating: ' + error.message);
        else {
            this.loadEmployees();
        }
    },

    async openEditAsset(id) {
        const { data: asset } = await window.supabaseClient.from('assets').select('*').eq('id', id).single();
        if (!asset) return;

        // Get employees for dropdown
        const { data: employees } = await window.supabaseClient.from('employees').select('id, name').order('name');
        let options = '<option value="">-- Unassigned --</option>';
        if (employees) {
            employees.forEach(e => {
                const selected = e.id === asset.employee_id ? 'selected' : '';
                options += `<option value="${e.id}" ${selected}>${e.name}</option>`;
            });
        }

        const isMouseOrKeyboard = ['Mouse', 'Keyboard'].includes(asset.type);
        const connectivityHtml = isMouseOrKeyboard ? `
            <div class="input-group">
                <label class="input-label">Connectivity</label>
                <select name="connectivity" class="input-field">
                    <option value="Wireless" ${asset.connectivity === 'Wireless' ? 'selected' : ''}>Wireless</option>
                    <option value="Wired" ${asset.connectivity === 'Wired' ? 'selected' : ''}>Wired</option>
                </select>
            </div>
        ` : '';

        const fields = `
            <div class="input-group">
                <label class="input-label">Type</label>
                <input type="text" class="input-field" value="${asset.type}" disabled style="background: #eee;">
            </div>
            <div class="input-group">
                <label class="input-label">Brand</label>
                <input type="text" name="brand" class="input-field" value="${asset.brand}" required>
            </div>
            <div class="input-group">
                <label class="input-label">Serial Number</label>
                <input type="text" name="serial_number" class="input-field" value="${asset.serial_number}" required>
            </div>
            ${connectivityHtml}
            <div class="input-group">
                <label class="input-label">Status</label>
                <select name="status" class="input-field" required>
                    <option value="Working" ${asset.status === 'Working' ? 'selected' : ''}>Working</option>
                    <option value="Repair" ${asset.status === 'Repair' ? 'selected' : ''}>Repair</option>
                    <option value="Replaced" ${asset.status === 'Replaced' ? 'selected' : ''}>Replaced</option>
                </select>
            </div>
            <div class="input-group">
                <label class="input-label">Assigned To</label>
                <select name="employee_id" class="input-field">
                    ${options}
                </select>
            </div>
        `;

        ui.openModal('Edit Asset', fields, async (fd) => {
            const updates = {
                brand: fd.get('brand'),
                serial_number: fd.get('serial_number'),
                status: fd.get('status'),
                employee_id: fd.get('employee_id') || null
            };
            if (isMouseOrKeyboard) {
                updates.connectivity = fd.get('connectivity');
            }
            await this.updateAsset(id, updates);
        });
    },

    async updateAsset(id, updates) {
        const { error } = await window.supabaseClient.from('assets').update(updates).eq('id', id);
        if (error) alert('Error updating: ' + error.message);
        else {
            this.loadAssets();
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

    // Connectivity Field Toggle logic for Add Form
    const assetTypeSelect = document.querySelector('select[name="type"]');
    const connectivityDiv = document.createElement('div');
    connectivityDiv.className = 'input-group hidden';
    connectivityDiv.id = 'add-connectivity-group';
    connectivityDiv.innerHTML = `
        <label class="input-label">Connectivity</label>
        <select name="connectivity" class="input-field">
            <option value="Wireless">Wireless</option>
            <option value="Wired">Wired</option>
        </select>
    `;
    // Insert after Type
    assetTypeSelect.closest('.input-group').after(connectivityDiv);

    assetTypeSelect.addEventListener('change', (e) => {
        if (['Mouse', 'Keyboard'].includes(e.target.value)) {
            connectivityDiv.classList.remove('hidden');
        } else {
            connectivityDiv.classList.add('hidden');
        }
    });
});
