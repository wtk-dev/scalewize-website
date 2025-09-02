-- Fix infinite recursion in profiles RLS policy
-- This is the immediate fix for the critical error

-- Drop the problematic policy
DROP POLICY IF EXISTS "profiles_select" ON profiles;

-- Create a simple, non-recursive policy
CREATE POLICY "profiles_select" ON profiles
    FOR SELECT
    USING (
        -- Allow service_role to bypass RLS completely
        auth.role() = 'service_role' OR
        -- Allow users to see their own profile
        id = auth.uid() OR
        -- Allow users to see profiles in the same organization (simple check)
        organization_id = (
            SELECT organization_id 
            FROM profiles 
            WHERE id = auth.uid() 
            LIMIT 1
        )
    );

-- Also fix other policies that might have similar issues
DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_update" ON profiles
    FOR UPDATE
    USING (
        auth.role() = 'service_role' OR
        id = auth.uid()
    )
    WITH CHECK (
        auth.role() = 'service_role' OR
        id = auth.uid()
    );

DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert" ON profiles
    FOR INSERT
    WITH CHECK (
        auth.role() = 'service_role' OR
        id = auth.uid()
    );

-- Ensure organizations policies are also safe
DROP POLICY IF EXISTS "organizations_select" ON organizations;
CREATE POLICY "organizations_select" ON organizations
    FOR SELECT
    USING (
        auth.role() = 'service_role' OR
        id IN (
            SELECT organization_id 
            FROM profiles 
            WHERE id = auth.uid()
        )
    );
