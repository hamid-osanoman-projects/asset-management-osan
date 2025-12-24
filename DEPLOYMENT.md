# Deployment Guide - Asset Management System

## 1. Prerequisites
- A free [Supabase](https://supabase.com/) account.
- A GitHub account (for GitHub Pages) OR Vercel account.

## 2. Database Setup (Supabase)
1.  Create a new project in Supabase.
2.  Go to the **SQL Editor** in the left sidebar.
3.  Click "New Query".
4.  Copy the contents of `db/schema.sql` from this project.
5.  Paste it into the query editor and click **Run**.
    - This creates the `employees` and `assets` tables and sets up security policies.

## 3. Configuration
1.  Go to **Project Settings** -> **API** in Supabase.
2.  Copy the `Project URL` and `anon` public key.
3.  Open `js/supabase-client.js` in your code editor.
4.  Replace the placeholders:
    ```javascript
    const SUPABASE_URL = 'https://your-project.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJh...';
    ```

## 4. Authentication Setup
1.  Go to **Authentication** -> **Providers** in Supabase.
2.  Ensure **Email** provider is enabled.
3.  Go to **Authentication** -> **Users**.
4.  Click **Invite User** and send an invite to your own email.
    - **IMPORTANT**: If you see *"Error sending invite email"*, it means Supabase's default email service is down or rate-limited.
    - **Workaround**: Instead of "Invite", use the **Create User** button (sometimes labeled "Add User").
    - Enter email and **manually set a password**.
    - If needed, verify the email manually by clicking the "More" context menu on the user row -> **Confirm Email**.

## 5. Deployment

### Option A: GitHub Pages
1.  Push this code to a GitHub repository.
2.  Go to **Settings** -> **Pages**.
3.  Select `main` branch and `/` root folder.
4.  Save. Your site will be live at `https://username.github.io/repo-name`.

    **Custom Domain (Optional):**
    - Under **Pages** settings, in the "Custom domain" field, enter your domain (e.g., `assets.mycompany.com`).
    - Click **Save**.
    - In your DNS provider (GoDaddy, Namecheap, etc.), create a **CNAME record**:
        - **Host**: `assets` (or `@` for root domain)
        - **Value**: `username.github.io`
    - Wait for DNS propagation (can take up to 24h).

### Option B: Vercel
1.  Install Vercel CLI or go to [vercel.com](https://vercel.com).
2.  Import your GitHub repository.
3.  Deploy. (No fancy build settings needed, it's just static HTML/JS).

## 6. Verification
1.  Visit your deployed URL (e.g., `https://my-system.vercel.app`).
2.  Login with the admin user you created.
3.  Create an employee and assign an asset.
4.  Scan the generated QR code with your phone to verify the public page.
