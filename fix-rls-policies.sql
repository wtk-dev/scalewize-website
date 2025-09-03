-- Fix RLS policies to allow service_role bypass
-- This will resolve the "Database error saving new user" and invitation issues

-- 1. Fix profiles table RLS policies
-- Allow service_role to bypass RLS for all operations
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_select" ON profiles;

-- Create new policies that allow service_role bypass
CREATE POLICY "profiles_insert" ON profiles
    FOR INSERT
    WITH CHECK (
        -- Allow service_role to bypass RLS
        auth.role() = 'service_role' OR
        -- Allow authenticated users to insert their own profile
        auth.uid() = id
    );

CREATE POLICY "profiles_select" ON profiles
    FOR SELECT
    USING (
        -- Allow service_role to bypass RLS
        auth.role() = 'service_role' OR
        -- Allow users to see their own profile
        id = auth.uid() OR
        -- Allow users to see profiles in their organization
        organization_id IN (
            SELECT profiles.organization_id
            FROM profiles
            WHERE profiles.id = auth.uid()
        )
    );

-- 2. Fix organizations table RLS policies
DROP POLICY IF EXISTS "organizations_insert" ON organizations;
DROP POLICY IF EXISTS "organizations_select" ON organizations;

CREATE POLICY "organizations_insert" ON organizations
    FOR INSERT
    WITH CHECK (
        -- Allow service_role to bypass RLS
        auth.role() = 'service_role' OR
        -- Allow authenticated users to create organizations
        auth.role() = 'authenticated'
    );

CREATE POLICY "organizations_select" ON organizations
    FOR SELECT
    USING (
        -- Allow service_role to bypass RLS
        auth.role() = 'service_role' OR
        -- Allow all authenticated users to see organizations
        auth.role() = 'authenticated'
    );

-- 3. Fix invitations table RLS policies
DROP POLICY IF EXISTS "Allow admins to manage invitations" ON invitations;

CREATE POLICY "Allow admins to manage invitations" ON invitations
    FOR ALL
    USING (
        -- Allow service_role to bypass RLS
        auth.role() = 'service_role' OR
        -- Allow admins to manage invitations
        organization_id IN (
            SELECT profiles.organization_id
            FROM profiles
            WHERE (
                profiles.id = auth.uid() AND
                profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text])
            )
        )
    )
    WITH CHECK (
        -- Allow service_role to bypass RLS
        auth.role() = 'service_role' OR
        -- Allow admins to manage invitations
        organization_id IN (
            SELECT profiles.organization_id
            FROM profiles
            WHERE (
                profiles.id = auth.uid() AND
                profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text])
            )
        )
    );

-- 4. Add service_role bypass to other critical policies
-- Update leads table policy
DROP POLICY IF EXISTS "User inserts own leads" ON leads;

CREATE POLICY "User inserts own leads" ON leads
    FOR INSERT
    WITH CHECK (
        -- Allow service_role to bypass RLS
        auth.role() = 'service_role' OR
        -- Allow users to insert their own leads
        auth.uid() IN (
            SELECT profiles.id
            FROM profiles
            WHERE (
                profiles.organization_id = leads.organization_id AND
                profiles.id = leads.user_id
            )
        )
    );

-- 5. Verify the changes
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('profiles', 'organizations', 'invitations', 'leads')
ORDER BY tablename, policyname;
