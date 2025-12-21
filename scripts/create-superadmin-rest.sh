#!/bin/bash

# Script untuk membuat superadmin user menggunakan Supabase REST API
# Jalankan dengan: bash scripts/create-superadmin-rest.sh

# Load environment variables
source .env

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY" ]; then
    echo "Missing required environment variables:"
    echo "- NEXT_PUBLIC_SUPABASE_URL"
    echo "- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY"
    exit 1
fi

echo "Creating superadmin user..."

# Sign up user
SIGNUP_RESPONSE=$(curl -s -X POST \
  "$NEXT_PUBLIC_SUPABASE_URL/auth/v1/signup" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@gmail.com",
    "password": "superadmin_password123",
    "data": {
      "name": "Superadmin",
      "role": "admin"
    }
  }')

echo "Signup response: $SIGNUP_RESPONSE"

# Extract error message if exists
ERROR=$(echo "$SIGNUP_RESPONSE" | jq -r '.error // empty')

if [ -n "$ERROR" ] && [ "$ERROR" != "null" ]; then
    if [[ "$ERROR" == *"already registered"* ]]; then
        echo "✓ Superadmin user already exists in Supabase Auth"
    else
        echo "❌ Signup error: $ERROR"
        exit 1
    fi
else
    echo "✓ Superadmin user created in Supabase Auth"
fi

# Sign in untuk mendapatkan session
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
    echo "❌ Failed to get access token"
    exit 1
fi

echo "✓ Successfully signed in"

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