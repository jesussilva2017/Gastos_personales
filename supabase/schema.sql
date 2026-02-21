-- Users table is managed by Supabase Auth (auth.users)

-- Profiles
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  nombre text not null,
  apellido text not null,
  celular text not null,
  rol text default 'user'::text not null,
  activo boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Categories
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  emoji text not null,
  user_id uuid references auth.users on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Transactions
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  valor numeric not null check (valor > 0),
  tipo text check (tipo in ('ingreso', 'gasto')) not null,
  categoria_id uuid references public.categories on delete set null,
  user_id uuid references auth.users on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ROW LEVEL SECURITY (RLS)

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;

-- Policies para Profiles

-- Los usuarios pueden ver o actualizar su propio perfil
create policy "Usuarios pueden ver su propio perfil" on public.profiles
  for select using (auth.uid() = id);

create policy "Usuarios pueden actualizar su propio perfil" on public.profiles
  for update using (auth.uid() = id);

-- El admin puede ver, insertar, actualizar y eliminar todos los perfiles
create policy "Admin tiene acceso total a profiles" on public.profiles
  for all using (
    (select rol from public.profiles where id = auth.uid()) = 'admin'
  );

-- Policies para Categories

-- Los usuarios pueden ver, insertar, actualizar y eliminar sus propias categorias
create policy "Usuarios acceso a sus propias categorias" on public.categories
  for all using (auth.uid() = user_id);

-- El admin puede ver todas las categorias
create policy "Admin puede ver todas las categorias" on public.categories
  for select using (
    (select rol from public.profiles where id = auth.uid()) = 'admin'
  );

-- Policies para Transactions

-- Los usuarios pueden ver, insertar, actualizar y eliminar sus propias transacciones
create policy "Usuarios acceso a sus propias transacciones" on public.transactions
  for all using (auth.uid() = user_id);

-- El admin puede ver todas las transacciones
create policy "Admin puede ver todas las transacciones" on public.transactions
  for select using (
    (select rol from public.profiles where id = auth.uid()) = 'admin'
  );

-- Function and trigger para que se asigne admin automáticamente al primer usuario y user a los demás.
-- Aunque se hace desde el frontend/server action, es bueno tener RLS configurado apropiadamente.
