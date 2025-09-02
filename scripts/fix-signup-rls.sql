-- Fix RLS policies for organization creation during signup
-- Run this in your Supabase SQL editor

-- Drop the existing problematic policies
DROP POLICY IF EXISTS "Enable organization creation during signup" ON organizations;
DROP POLICY IF EXISTS "organizations_insert_signup" ON organizations;

-- Create a new policy that allows organization creation for authenticated users
-- This will work for both immediate authentication and email confirmation flows
CREATE POLICY "Allow organization creation for authenticated users" ON organizations
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
  );

-- Also create a policy that allows organization creation during signup
-- This handles the case where a user is created but not yet fully authenticated
CREATE POLICY "Allow organization creation during signup" ON organizations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email_confirmed_at IS NOT NULL
    )
    OR 
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.created_at > NOW() - INTERVAL '5 minutes'
    )
  );

-- Update the profiles policy to be more permissive during signup
DROP POLICY IF EXISTS "Enable profile creation during signup" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_signup" ON profiles;

CREATE POLICY "Allow profile creation for authenticated users" ON profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id
  );

-- Create a more permissive policy for signup scenarios
CREATE POLICY "Allow profile creation during signup" ON profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id
    OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.created_at > NOW() - INTERVAL '5 minutes'
    )
  );
