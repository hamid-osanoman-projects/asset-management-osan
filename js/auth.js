// Authentication Logic

const auth = {
    // Login with Email and Password
    async login(email, password) {
        try {
            const { data, error } = await window.supabaseClient.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) throw error;

            console.log('Login successful:', data);
            window.location.href = 'admin.html';
        } catch (error) {
            console.error('Login error:', error.message);
            alert('Login failed: ' + error.message);
        }
    },

    // Logout
    async logout() {
        try {
            const { error } = await window.supabaseClient.auth.signOut();
            if (error) throw error;
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Logout error:', error.message);
        }
    },

    // Check if user is authenticated
    async checkSession() {
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        if (!session) {
            // If not logged in and not on login page, redirect
            if (!window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('/') && !window.location.pathname.includes('employee.html')) {
                window.location.href = 'index.html';
            }
        } else {
            // If logged in and on login page, redirect to admin
            if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
                window.location.href = 'admin.html';
            }
        }
    },

    // Get current user
    async getUser() {
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        return user;
    }
};

// Expose auth to window
window.auth = auth;

// Run session check on load
document.addEventListener('DOMContentLoaded', () => {
    // Don't check session on public employee page purely by default logic, 
    // but auth.checkSession handles that exception.
    auth.checkSession();
});
