#!/bin/bash

# Script untuk mengkonfirmasi email superadmin dan melanjutkan setup
# Jalankan dengan: bash scripts/confirm-superadmin.sh

# Load environment variables
source .env

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY" ]; then
    echo "Missing required environment variables:"
    echo "- NEXT_PUBLIC_SUPABASE_URL"
    echo "- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY"
    exit 1
fi

echo "Confirming superadmin email and completing setup..."

# Sign in untuk mendapatkan session (tanpa konfirmasi email)
SIGNIN_RESPONSE=$(curl -s -X POST \
  "$NEXT_PUBLIC_SUPABASE_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@gmail.com",
    "password": "superadmin_password123"
  }')

echo "Signin response: $SIGNIN_RESPONSE"

# Extract access token
ACCESS_TOKEN=$(echo "$SIGNIN_RESPONSE" | jq -r '.access_token // empty')

if [ -z "$ACCESS_TOKEN" ]; then
    echo "❌ Failed to get access token, trying admin confirmation..."
    
    # Coba dengan admin confirmation token
    ADMIN_CONFIRM_RESPONSE=$(curl -s -X POST \
      "$NEXT_PUBLIC_SUPABASE_URL/auth/v1/verify" \
      -H "apikey: $NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "type": "signup",
        "email": "superadmin@gmail.com"
      }')
    
    echo "Admin confirm response: $ADMIN_CONFIRM_RESPONSE"
    
    # Coba login lagi
    SIGNIN_RESPONSE=$(curl -s -X POST \
      "$NEXT_PUBLIC_SUPABASE_URL/auth/v1/token?grant_type=password" \
      -H "apikey: $NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "email": "superadmin@gmail.com",
        "password": "superadmin_password123"
      }')
    
    ACCESS_TOKEN=$(echo "$SIGNIN_RESPONSE" | jq -r '.access_token // empty')
    
    if [ -z "$ACCESS_TOKEN" ]; then
        echo "❌ Still failed to get access token"
        echo "Please manually confirm the email in Supabase Dashboard:"
        echo "1. Go to Authentication → Users"
        echo "2. Find superadmin@gmail.com"
        echo "3. Click 'Confirm email'"
        exit 1
    fi
fi

echo "✓ Successfully got access token"

# Insert ke custom users table
USERS_RESPONSE=$(curl -s -X POST \
  "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/users" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@gmail.com",
    "name": "Superadmin",
    "password_hash": "superadmin_password123",
    "is_active": true
  }' \
  -H "Prefer: return=minimal")

echo "Users table response: $USERS_RESPONSE"

# Get admin role ID
ROLE_RESPONSE=$(curl -s -X GET \
  "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/roles?name=eq.admin" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Role response: $ROLE_RESPONSE"

ROLE_ID=$(echo "$ROLE_RESPONSE" | jq -r '.[0].id // empty')

if [ -z "$ROLE_ID" ]; then
    echo "❌ Failed to get admin role ID"
    exit 1
fi

# Get user ID from custom users table
USER_RESPONSE=$(curl -s -X GET \
  "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/users?email=eq.superadmin@gmail.com" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "User response: $USER_RESPONSE"

USER_ID=$(echo "$USER_RESPONSE" | jq -r '.[0].id // empty')

if [ -z "$USER_ID" ]; then
    echo "❌ Failed to get user ID"
    exit 1
fi

# Assign admin role to user
ASSIGNMENT_RESPONSE=$(curl -s -X POST \
  "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/user_roles" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"user_id\": $USER_ID,
    \"role_id\": $ROLE_ID
  }" \
  -H "Prefer: return=minimal")

echo "Assignment response: $ASSIGNMENT_RESPONSE"

echo ""
echo "🎉 Superadmin setup completed successfully!"
echo ""
echo "Login credentials:"
echo "Email: superadmin@gmail.com"
echo "Password: superadmin_password123"
echo ""
echo "⚠️  Note: The user has been created but may need email confirmation"
echo "   If login fails, please confirm the email in Supabase Dashboard:"
echo "   1. Go to Authentication → Users"
echo "   2. Find superadmin@gmail.com"
echo "   3. Click 'Confirm email'"