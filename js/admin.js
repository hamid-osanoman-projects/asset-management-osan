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

        // Reset buttons visibility (in case hidden by view assets)
        // Reset buttons visibility (in case hidden by view assets)
        const btnCancel = document.getElementById('modal-btn-cancel');
        const btnSave = document.getElementById('modal-btn-save');

        if (btnCancel && btnSave) {
            btnCancel.textContent = "Cancel";
            btnCancel.classList.remove('hidden');
            btnSave.textContent = "Save Changes";
            btnSave.classList.remove('hidden');

            // Clear specific logic assignments if any (standard reset)
            btnCancel.onclick = () => this.closeModal();
        }


        // Handle form submission
        // const form = document.getElementById('edit-form'); // Already declared above
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
                    <p style="color: var(--text-muted); font-size: 0.9rem;">${emp.company || ''}</p>
                    <p style="font-size: 0.8rem;">${emp.email}</p>
                    ${emp.custom_id ? `<span class="status-badge" style="background:#eee; color:#333; margin-top:4px; display:inline-block;">${emp.custom_id}</span>` : ''}
                </div>
                <!-- Container with fixed CSS size (80px) -->
                <div id="qr-${emp.id}" class="card-qr-preview"></div>
            </div>
            
            <div class="mt-4 flex justify-between items-center border-t pt-3" style="border-color: var(--border-color);">
                <div class="flex gap-2">
                    <button onclick="dataManager.viewEmployeeAssets('${emp.id}', '${emp.name}')" class="icon-btn" title="View Assigned Assets">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
</svg>
                    </button>
                    <button onclick="dataManager.openEditEmployee('${emp.id}')" class="icon-btn" title="Edit Employee">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
</svg>
                    </button>
                    <a href="employee.html?id=${emp.id}" target="_blank" class="icon-btn" title="View Public Profile">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
</svg>
                    </a>
                </div>
                <button onclick="dataManager.deleteEmployee('${emp.id}')" class="icon-btn delete" title="Delete Employee">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
</svg>
                </button>
            </div>
        `;

        // Generate QR
        setTimeout(() => {
            const qrContainer = div.querySelector(`#qr-${emp.id}`);
            // Clear prev
            qrContainer.innerHTML = '';
            // URL
            const url = window.location.href.replace('admin.html', 'employee.html').split('#')[0] + `?id=${emp.id}`;
            // 256 for quality, but CSS restricts display to 80px
            new QRCode(qrContainer, {
                text: url,
                width: 256,
                height: 256,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.M
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
            <div class="mt-4 text-right flex justify-end gap-2 border-t pt-3" style="border-color: var(--border-color);">
                <button onclick="dataManager.openEditAsset('${asset.id}')" class="icon-btn" title="Edit Asset">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
</svg>
                </button>
                <button onclick="dataManager.deleteAsset('${asset.id}')" class="icon-btn delete" title="Delete Asset">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
</svg>
                </button>
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
            company: fd.get('company'),
            custom_id: await this.generateCustomId(fd.get('company'))
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
        // Check for assigned assets first
        const { count, error: countError } = await window.supabaseClient
            .from('assets')
            .select('*', { count: 'exact', head: true })
            .eq('employee_id', id);

        if (countError) {
            alert('Error checking assets: ' + countError.message);
            return;
        }

        if (count > 0) {
            alert(`Cannot delete this employee because they have ${count} assigned asset(s). Please unassign the assets first.`);
            return;
        }

        if (!confirm('Are you sure you want to delete this employee?')) return;

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

    downloadQR(elementId, name) {
        // If elementId is just the ID string (from card), prepend 'qr-'
        // If it's a full ID (from modal), use as is
        const targetId = elementId.startsWith('qr-') || elementId === 'modal-qr-preview' ? elementId : `qr-${elementId}`;
        const div = document.getElementById(targetId);
        if (!div) return;

        let src = '';
        const img = div.querySelector('img');
        const canvas = div.querySelector('canvas');

        if (img && img.src) {
            src = img.src;
        } else if (canvas) {
            src = canvas.toDataURL("image/png");
        }

        if (src) {
            const link = document.createElement('a');
            link.href = src;
            link.download = `QR_${name.replace(/\s+/g, '_')}.png`;
            document.body.appendChild(link); // Required for some browsers (Firefox/Mobile)
            link.click();
            document.body.removeChild(link);
        } else {
            // Debugging for User
            const childTags = Array.from(div.children).map(c => c.tagName).join(', ');
            alert(`Unable to download. Debug info: Found tags [${childTags}]. Image source present: ${img ? !!img.src : 'N/A'}`);
        }
    },

    // Edit Logic
    async openEditEmployee(id) {
        const { data: emp } = await window.supabaseClient.from('employees').select('*').eq('id', id).single();
        if (!emp) return;

        const fields = `
            <div class="input-group">
                <label class="input-label">Company</label>
                <input type="text" class="input-field" value="${emp.company || ''}" disabled style="background:#eee;">
            </div>
            <div class="input-group">
                <label class="input-label">Full Name</label>
                <input type="text" name="name" class="input-field" value="${emp.name}" required>
            </div>
            <div class="input-group">
                <label class="input-label">Email</label>
                <input type="email" name="email" class="input-field" value="${emp.email}" required>
            </div>
            
            <div class="mt-4 p-4 border rounded bg-gray-50 flex items-center justify-between" style="border-color: var(--border-color);">
                <div>
                   <p class="font-bold text-sm">QR Code (High Res)</p>
                   <p class="text-xs text-muted">Scan to view profile</p>
                   <p class="text-sm font-mono mt-1">${emp.custom_id || ''}</p>
                </div>
                <div class="flex flex-col items-end gap-2">
                    <!-- Adjusted size for display via CSS class -->
                    <div id="modal-qr-preview" class="qr-preview-box"></div> 
                    <button type="button" onclick="dataManager.downloadQR('modal-qr-preview', '${emp.name}')" class="btn btn-outline" style="font-size: 0.8rem; padding: 0.3rem 0.8rem;">
                        Download
                    </button>
                </div>
            </div>
        `;

        ui.openModal('Edit Employee', fields, async (fd) => {
            await this.updateEmployee(id, {
                name: fd.get('name'),
                email: fd.get('email')
            });
        });

        // Generate QR in Modal
        setTimeout(() => {
            const qrContainer = document.getElementById('modal-qr-preview');
            // URL: Use replace on current HREF to keep the repo path (for GitHub Pages)
            const url = window.location.href.replace('admin.html', 'employee.html').split('#')[0] + `?id=${emp.id}`;
            new QRCode(qrContainer, {
                text: url,
                width: 512, // High High Res for Download (can go higher if needed)
                height: 512,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H // High error correction
            });
            // No need to force inline style sizes here anymore, CSS handles .qr-preview-box children
        }, 100);
    },

    async updateEmployee(id, updates) {
        const { error } = await window.supabaseClient.from('employees').update(updates).eq('id', id);
        if (error) alert('Error updating: ' + error.message);
        else {
            this.loadEmployees();
        }
    },

    async viewEmployeeAssets(id, name) {
        // Fetch assets for this employee
        const { data: assets, error } = await window.supabaseClient
            .from('assets')
            .select('*')
            .eq('employee_id', id)
            .order('created_at', { ascending: false });

        let content = '';

        if (error) {
            content = `<p class="text-error">Error loading assets: ${error.message}</p>`;
        } else if (!assets || assets.length === 0) {
            content = `<p class="text-center text-muted py-4">No assets assigned to ${name}.</p>`;
        } else {
            content = `<div class="flex flex-col gap-2">`;
            assets.forEach(asset => {
                const colorClass = asset.status === 'Working' ? 'status-working' : (asset.status === 'Repair' ? 'status-repair' : 'status-replaced');
                const connectivityBadge = asset.connectivity ? `<span style="font-size: 0.7rem; background: #eee; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">${asset.connectivity}</span>` : '';

                content += `
                    <div style="border: 1px solid var(--border-color); padding: 0.75rem; border-radius: var(--radius); background: #f9fafb;">
                        <div class="flex justify-between items-start">
                            <h4 style="font-size: 0.9rem; font-weight: 600;">${asset.brand} <span class="font-normal text-muted">(${asset.type})</span> ${connectivityBadge}</h4>
                            <span class="status-badge ${colorClass}" style="font-size: 0.7rem;">${asset.status}</span>
                        </div>
                        <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">S/N: ${asset.serial_number}</p>
                    </div>
                `;
            });
            content += `</div>`;
        }

        ui.openModal(`Assets: ${name}`, content, async () => {
            // Check if modal allows read-only close or if we need empty save handler
            // Current openModal implementation expects a form submission.
            // We can just close it via the close button, but let's handle the save callback gracefully.
            // Or better, let's just use openModal but hide the save button in this context?
            // Since openModal renders a form, we can just pass an empty async function.
            ui.closeModal();
        });

        // Hide the "Save Changes" and "Cancel" buttons for this read-only view, or change text
        const form = document.getElementById('edit-form');
        const btns = form.querySelectorAll('button');
        if (btns.length >= 2) {
            btns[0].textContent = "Close"; // Cancel button
            btns[0].onclick = () => ui.closeModal();
            btns[1].classList.add('hidden'); // Save button
        }

        // Restoration logic when modal closes? 
        // A simple way is to reset the modal state when it opens again for editing.
        // We should update openModal to handle this better, but for now this 'hack' works if openModal resets buttons.
        // Let's modify openModal instead to be safer.
    },

    async openEmployeeDetails(id) {
        // Fetch full employee and their assets
        const { data: emp, error: eErr } = await window.supabaseClient.from('employees').select('*').eq('id', id).single();
        const { data: assets, error: aErr } = await window.supabaseClient.from('assets').select('*').eq('employee_id', id);

        if (eErr || !emp) { console.error(eErr); return; }

        // Build Asset List HTML
        let assetHtml = '<p class="text-muted text-sm italic">No assets assigned.</p>';
        if (assets && assets.length > 0) {
            assetHtml = `<div class="flex flex-col gap-2">`;
            assets.forEach(asset => {
                assetHtml += `
                    <div style="border: 1px solid var(--border-color); padding: 0.5rem; border-radius: 4px; background: #f9fafb;">
                        <div class="flex justify-between">
                            <span style="font-size:0.85rem; font-weight:600;">${asset.brand} ${asset.type}</span>
                            <span style="font-size:0.75rem; background:#fff; border:1px solid #ccc; padding:0 4px; border-radius:3px;">${asset.status}</span>
                        </div>
                        <div style="font-size:0.75rem; color:var(--text-muted);">S/N: ${asset.serial_number}</div>
                    </div>
                 `;
            });
            assetHtml += `</div>`;
        }

        const content = `
            <!-- Info Section -->
            <div class="detail-section">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <div class="detail-label">Full Name</div>
                        <div class="detail-value">${emp.name}</div>
                    </div>
                     <div>
                        <div class="detail-label">ID</div>
                        <div class="detail-value">${emp.custom_id || 'N/A'}</div>
                    </div>
                </div>
                 <div class="mt-3">
                    <div class="detail-label">Email</div>
                    <div class="detail-value text-sm">${emp.email}</div>
                 </div>
                  <div class="mt-3">
                    <div class="detail-label">Company</div>
                    <div class="detail-value">${emp.company || 'N/A'}</div>
                 </div>
            </div>
            
            <!-- Assets Section -->
             <div class="detail-section">
                <div class="detail-label mb-2">Assigned Assets</div>
                ${assetHtml}
             </div>
             
             <!-- QR Section -->
              <div class="detail-section" style="border:none; text-align:center;">
                <div class="detail-label mb-2">Employee QR Code</div>
                <div id="detail-qr-view" style="display:inline-block; padding:10px; background:white; border:1px solid #ddd; border-radius:8px;"></div>
                <div class="mt-3">
                    <button onclick="dataManager.downloadQR('detail-qr-view', '${emp.name}')" class="btn btn-outline w-full">
                        Download QR
                    </button>
                    <a href="employee.html?id=${emp.id}" target="_blank" class="block mt-2 text-center text-sm text-accent underline">View Public Page</a>
                </div>
              </div>
         `;

        // Open Modal (Generic)
        ui.openModal(`Employee Details`, content, null); // Null callback means read-only/no form save

        // Hide Save Button logic (similar to view assets)
        const form = document.getElementById('edit-form');
        const btns = form.querySelectorAll('button');
        if (btns.length >= 2) {
            btns[0].textContent = "Close";
            btns[0].onclick = () => ui.closeModal();
            btns[1].classList.add('hidden');
        }

        // Generate High Res QR
        setTimeout(() => {
            const qrContainer = document.getElementById('detail-qr-view');
            const url = window.location.href.replace('admin.html', 'employee.html').split('#')[0] + `?id=${emp.id}`;
            new QRCode(qrContainer, {
                text: url,
                width: 256,
                height: 256,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        }, 100);
    },

    async generateCustomId(companyName) {
        if (!companyName) return null;

        let prefix = 'EMP';
        if (companyName === 'Osan Studio') prefix = 'OST';
        else if (companyName === 'Osbic') prefix = 'OSB';
        else if (companyName === 'ASAS') prefix = 'AS';
        else if (companyName === 'Maisarah') prefix = 'MSH';

        // Find last ID with this prefix
        const { data, error } = await window.supabaseClient
            .from('employees')
            .select('custom_id')
            .ilike('custom_id', `${prefix}-%`)
            .order('custom_id', { ascending: false })
            .limit(1);

        let nextNum = 1;
        if (data && data.length > 0 && data[0].custom_id) {
            const parts = data[0].custom_id.split('-');
            if (parts.length === 2 && !isNaN(parts[1])) {
                nextNum = parseInt(parts[1]) + 1;
            }
        }

        // Format as 01, 02, etc.
        const numStr = nextNum.toString().padStart(2, '0');
        return `${prefix}-${numStr}`;
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
    document.getElementById('form-employee').addEventListener('submit', (e) => dataManager.createEmployee(e));
    document.getElementById('form-asset').addEventListener('submit', (e) => dataManager.createAsset(e));

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
