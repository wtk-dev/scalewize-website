-- Check all RLS policies in the database
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
ORDER BY schemaname, tablename, policyname;

-- Check if RLS is enabled on tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check table ownership and permissions
SELECT 
    t.table_name,
    t.table_type,
    p.privilege_type,
    p.grantee
FROM information_schema.tables t
LEFT JOIN information_schema.table_privileges p ON t.table_name = p.table_name
WHERE t.table_schema = 'public'
ORDER BY t.table_name, p.privilege_type;
