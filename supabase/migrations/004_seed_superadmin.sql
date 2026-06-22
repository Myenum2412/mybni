-- Seed superadmin user
-- Run this ENTIRE block in Supabase SQL Editor
-- Default superadmin credentials:
--   Email: superadmin@bni.com
--   Password: SuperAdmin@123

DO $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Check if superadmin already exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'superadmin@bni.com') THEN
    -- Create auth user
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    VALUES (
      gen_random_uuid(),
      'superadmin@bni.com',
      crypt('SuperAdmin@123', gen_salt('bf')),
      now(),
      '{"name": "Super Admin"}'::jsonb,
      now(),
      now()
    )
    RETURNING id INTO new_user_id;

    -- Create profile
    INSERT INTO public.users (id, email, name, role, chapter_id)
    VALUES (new_user_id, 'superadmin@bni.com', 'Super Admin', 'superadmin', NULL);

    RAISE NOTICE 'Superadmin created with ID: %', new_user_id;
  ELSE
    RAISE NOTICE 'Superadmin already exists, skipping.';
  END IF;
END $$;
