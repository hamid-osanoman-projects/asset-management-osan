// Public View Logic

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const profileEl = document.getElementById('profile');
    const timestampEl = document.getElementById('timestamp');

    // Set timestamp
    timestampEl.textContent = new Date().toLocaleString();

    if (!id) {
        loadingEl.classList.add('hidden');
        errorEl.textContent = 'No Employee ID provided.';
        errorEl.classList.remove('hidden');
        return;
    }

    try {
        // Fetch Employee
        const { data: employee, error: empError } = await window.supabaseClient
            .from('employees')
            .select('*')
            .eq('id', id)
            .single();

        if (empError || !employee) throw new Error('Employee not found');

        // Fetch Assets
        const { data: assets, error: assetError } = await window.supabaseClient
            .from('assets')
            .select('*')
            .eq('employee_id', id);

        if (assetError) console.error('Error fetching assets:', assetError);

        // Render Profile
        document.getElementById('emp-name').textContent = employee.name;
        document.getElementById('emp-dept').textContent = employee.department;
        document.getElementById('emp-email').textContent = employee.email;

        // Render Assets
        const assetList = document.getElementById('asset-list');
        assetList.innerHTML = '';

        if (!assets || assets.length === 0) {
            assetList.innerHTML = '<p class="text-center text-muted">No assets assigned.</p>';
        } else {
            assets.forEach(asset => {
                const div = document.createElement('div');
                div.className = 'card';
                div.style.padding = '1rem'; // Compact

                const colorClass = asset.status === 'Working' ? 'status-working' : (asset.status === 'Repair' ? 'status-repair' : 'status-replaced');

                div.innerHTML = `
                    <div class="flex justify-between items-center">
                        <span style="font-weight: 600;">${asset.brand}</span>
                        <span class="status-badge ${colorClass}">${asset.status}</span>
                    </div>
                    <div class="flex justify-between mt-2" style="font-size: 0.8rem;">
                        <span style="color: var(--text-muted);">${asset.type}</span>
                        <span style="font-family: monospace;">${asset.serial_number}</span>
                    </div>
                `;
                assetList.appendChild(div);
            });
        }

        loadingEl.classList.add('hidden');
        profileEl.classList.remove('hidden');

    } catch (err) {
        console.error(err);
        loadingEl.classList.add('hidden');
        errorEl.classList.remove('hidden');
    }
});
