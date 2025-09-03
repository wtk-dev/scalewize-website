-- Fix existing invitations table schema
-- This adds the missing 'role' column and updates the table structure

-- 1. Add the missing 'role' column
ALTER TABLE invitations 
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- 2. Add 'updated_at' column if it doesn't exist
ALTER TABLE invitations 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Create updated_at trigger if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_invitations_updated_at ON invitations;

-- Create the trigger
CREATE TRIGGER update_invitations_updated_at
    BEFORE UPDATE ON invitations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Update RLS policies to match our new structure
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "invitations_select" ON invitations;
DROP POLICY IF EXISTS "invitations_insert" ON invitations;
DROP POLICY IF EXISTS "invitations_update" ON invitations;
DROP POLICY IF EXISTS "invitations_delete" ON invitations;

-- Select policy: Users can see invitations for their organization
CREATE POLICY "invitations_select" ON invitations
    FOR SELECT
    USING (
        auth.role() = 'service_role' OR
        organization_id IN (
            SELECT organization_id
            FROM profiles
            WHERE id = auth.uid()
        )
    );

-- Insert policy: Only admins can create invitations
CREATE POLICY "invitations_insert" ON invitations
    FOR INSERT
    WITH CHECK (
        auth.role() = 'service_role' OR
        (
            invited_by = auth.uid() AND
            organization_id IN (
                SELECT organization_id
                FROM profiles
                WHERE id = auth.uid()
                AND role IN ('admin', 'super_admin')
            )
        )
    );

-- Update policy: Only admins can update invitations
CREATE POLICY "invitations_update" ON invitations
    FOR UPDATE
    USING (
        auth.role() = 'service_role' OR
        organization_id IN (
            SELECT organization_id
            FROM profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    )
    WITH CHECK (
        auth.role() = 'service_role' OR
        organization_id IN (
            SELECT organization_id
            FROM profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

-- Delete policy: Only admins can delete invitations
CREATE POLICY "invitations_delete" ON invitations
    FOR DELETE
    USING (
        auth.role() = 'service_role' OR
        organization_id IN (
            SELECT organization_id
            FROM profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

-- 5. Grant necessary permissions
GRANT ALL ON invitations TO authenticated;
GRANT ALL ON invitations TO service_role;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- 6. Test the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'invitations' 
ORDER BY ordinal_position;
