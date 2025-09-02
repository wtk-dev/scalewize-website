-- Check current profile data for the user
SELECT 
    id,
    email,
    full_name,
    role,
    organization_id,
    is_active,
    is_verified,
    email_verification_required,
    created_at,
    updated_at
FROM profiles 
WHERE email = 'sebastiandhk44@gmail.com';

-- Also check if there are any profiles for this user ID
SELECT 
    id,
    email,
    full_name,
    role,
    organization_id,
    is_active,
    is_verified,
    email_verification_required,
    created_at,
    updated_at
FROM profiles 
WHERE id = 'b1c6b5b7-74be-4298-8d92-05fad7069ede';
