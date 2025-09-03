-- Fix the profiles_select policy that's causing profile fetch timeouts
-- The current policy is too restrictive and blocking users from seeing their own profiles

-- Drop the problematic policy
DROP POLICY IF EXISTS "profiles_select" ON profiles;

-- Create a more permissive policy that allows:
-- 1. Service role to bypass RLS
-- 2. Users to see their own profile
-- 3. Users to see profiles in their organization
CREATE POLICY "profiles_select" ON profiles
    FOR SELECT
    USING (
        -- Allow service_role to bypass RLS
        auth.role() = 'service_role' OR
        -- Allow users to see their own profile
        id = auth.uid() OR
        -- Allow users to see profiles in their organization
        organization_id IN (
            SELECT p.organization_id
            FROM profiles p
            WHERE p.id = auth.uid()
        )
    );

-- Also fix the profiles_insert policy to be more permissive
DROP POLICY IF EXISTS "profiles_insert" ON profiles;

CREATE POLICY "profiles_insert" ON profiles
    FOR INSERT
    WITH CHECK (
        -- Allow service_role to bypass RLS
        auth.role() = 'service_role' OR
        -- Allow authenticated users to insert their own profile
        auth.uid() = id OR
        -- Allow service role to insert any profile
        auth.role() = 'service_role'
    );

-- Verify the changes
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;
