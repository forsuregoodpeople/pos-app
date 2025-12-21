#!/bin/bash

# Script sederhana untuk setup superadmin
# Jalankan dengan: bash scripts/simple-setup.sh

echo "🚀 Superadmin Setup for Sunda Servis"
echo "=================================="
echo ""

# Load environment variables
source .env

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY" ]; then
    echo "❌ Missing required environment variables:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY"
    exit 1
fi

echo "📧 Creating superadmin user in Supabase Auth..."

# Buat user dengan email confirmation
RESPONSE=$(curl -s -X POST \
  "$NEXT_PUBLIC_SUPABASE_URL/auth/v1/signup" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sunda.admin@gmail.com",
    "password": "superadmin_password123",
    "data": {
      "name": "Superadmin"
    }
  }')

echo "Signup response: $RESPONSE"

# Cek apakah user berhasil dibuat
ERROR=$(echo "$RESPONSE" | jq -r '.error // empty')

if [ -n "$ERROR" ] && [ "$ERROR" != "null" ]; then
    if [[ "$ERROR" == *"already registered"* ]]; then
        echo "✅ User already exists in Supabase Auth"
    else
        echo "❌ Signup error: $ERROR"
        echo ""
        echo "🔧 Manual Setup Required:"
        echo "1. Buka Supabase Dashboard"
        echo "2. Go to Authentication → Users"
        echo "3. Click 'Add user'"
        echo "4. Email: sunds.admin@gmail.com"
        echo "5. Password: superadmin_password123"
        echo "6. ✅ Enable 'Auto-confirm'"
        echo "7. Click 'Save'"
    fi
else
    echo "✅ Superadmin user created in Supabase Auth"
    echo ""
    echo "⚠️  IMPORTANT: Email confirmation required!"
    echo "1. Buka Supabase Dashboard"
    echo "2. Go to Authentication → Users"
    echo "3. Find sunds.admin@gmail.com"
    echo "4. Click 'Confirm email'"
fi

echo ""
echo "🔑 Login Credentials:"
echo "   Email: sunds.admin@gmail.com"
echo "   Password: superadmin_password123"
echo ""
echo "🌐 Login URL: http://localhost:3000/login"
echo ""
echo "📝 Next Steps:"
echo "1. Confirm email di Supabase Dashboard (jika diperlukan)"
echo "2. Login ke aplikasi dengan credentials di atas"
echo "3. Jika login gagal, user akan dibuat otomatis di custom tables"