-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create Employees Table
create table public.employees (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text unique not null,
  company text,
  custom_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Assets Table
create table public.assets (
  id uuid primary key default uuid_generate_v4(),
  type text not null check (type in ('Desktop', 'Mouse', 'Keyboard', 'Laptop', 'Monitor')), -- Extended list for realism
  brand text not null,
  serial_number text not null,
  connectivity text check (connectivity in ('Wired', 'Wireless')),
  status text not null check (status in ('Working', 'Repair', 'Replaced')),
  employee_id uuid references public.employees(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.employees enable row level security;
alter table public.assets enable row level security;

-- Policies for Employees
-- Admins have full access (Assuming Supabase Auth for admins)
create policy "Allow all actions for authenticated users" on public.employees
  for all using (auth.role() = 'authenticated');

-- Public read access for QR code view (needs to be open for the specific employee)
-- allowing public read for now to simplify QR scanning without auth
create policy "Allow public read access" on public.employees
  for select using (true); 

-- Policies for Assets
create policy "Allow all actions for authenticated users" on public.assets
  for all using (auth.role() = 'authenticated');

create policy "Allow public read access" on public.assets
  for select using (true);
