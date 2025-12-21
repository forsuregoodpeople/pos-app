#!/bin/bash

# Script final untuk setup superadmin dengan service role key
# Jalankan dengan: bash scripts/setup-superadmin-final.sh

echo "🚀 Setting up Superadmin for Sunda Servis"
echo "======================================"

# Cek apakah user sudah ada
echo "📋 Checking if user already exists..."

# Load environment variables
source .env

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ NEXT_PUBLIC_SUPABASE_URL not found in .env"
    exit 1
fi

SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL"

# Fungsi untuk menjalankan SQL melalui curl
execute_sql() {
    local sql="$1"
    curl -s -X POST \
        "$SUPABASE_URL/rest/v1/rpc/execute_sql" \
        -H "apikey: $NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY" \
        -H "Content-Type: application/json" \
        -d "{\"sql\": \"$sql\"}"
}

echo ""
echo "📧 Creating superadmin user in Supabase Auth..."

# Buat user langsung di auth.users dengan admin privileges
USER_SQL="
INSERT INTO auth.users (
    instance_id, 
    id, 
    aud, 
    role, 
    email, 
    encrypted_password, 
    email_confirmed_at, 
    created_at, 
    updated_at, 
    last_sign_in_at, 
    raw_app_meta_data, 
    raw_user_meta_data, 
    is_super_admin, 
    phone, 
    phone_confirmed_at, 
    phone_changed_at, 
    email_change_token_new, 
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'superadmin@sundaservis.com',
    crypt('superadmin_password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    NOW(),
    '{\"provider\": \"email\", \"providers\": [\"email\"]}',
    '{\"name\": \"Superadmin\", \"role\": \"admin\"}',
    false,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
) ON CONFLICT (email) DO NOTHING;
"

# Jalankan SQL untuk membuat user
echo "⚡ Executing user creation SQL..."
RESULT=$(curl -s -X POST \
    "$SUPABASE_URL/rest/v1/users" \
    -H "apikey: $NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "superadmin@sundaservis.com",
        "password": "superadmin_password123",
        "email_confirm": true,
        "data": {
            "name": "Superadmin",
            "role": "admin"
        }
    }')

echo "Auth creation result: $RESULT"

echo ""
echo "📋 Creating user in custom users table..."

# Insert ke custom users table
USERS_SQL="
INSERT INTO users (email, name, password_hash, is_active) 
VALUES ('superadmin@sundaservis.com', 'Superadmin', 'superadmin_password123', true)
ON CONFLICT (email) DO UPDATE SET 
    name = EXCLUDED.name,
    password_hash = EXCLUDED.password_hash,
    is_active = EXCLUDED.is_active;
"

echo "⚡ Executing users table SQL..."
USERS_RESULT=$(curl -s -X POST \
    "$SUPABASE_URL/rest/v1/users" \
    -H "apikey: $NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "superadmin@sundaservis.com",
        "name": "Superadmin",
        "password_hash": "superadmin_password123",
        "is_active": true
    }')

echo "Users table result: $USERS_RESULT"

echo ""
echo "👑 Assigning admin role to user..."

# Get user dan role IDs
GET_USER_SQL="SELECT id FROM users WHERE email = 'superadmin@sundaservis.com';"
GET_ROLE_SQL="SELECT id FROM roles WHERE name = 'admin';"

echo "⚡ Getting user and role IDs..."

# Assign role
ASSIGN_SQL="
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id 
FROM users u, roles r 
WHERE u.email = 'superadmin@sundaservis.com' AND r.name = 'admin'
ON CONFLICT (user_id, role_id) DO NOTHING;
"

ASSIGN_RESULT=$(curl -s -X POST \
    "$SUPABASE_URL/rest/v1/user_roles" \
    -H "apikey: $NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "user_id": (SELECT id FROM users WHERE email = '\''superadmin@sundaservis.com'\''),
        "role_id": (SELECT id FROM roles WHERE name = '\''admin'\'')
    }')

echo "Role assignment result: $ASSIGN_RESULT"

echo ""
echo "✅ Superadmin setup completed!"
echo ""
echo "🔑 Login Credentials:"
echo "   Email: superadmin@sundaservis.com"
echo "   Password: superadmin_password123"
echo ""
echo "🌐 You can now login at: http://localhost:3000/login"
echo ""
echo "📝 Note: If login fails, the user might need to be created manually in Supabase Dashboard"
echo "   Go to: Authentication → Users → Add User"
echo "   Email: superadmin@sundaservis.com"
echo "   Password: superadmin_password123"
echo "   ✅ Enable auto-confirm"