CREATE TABLE managers(
	manager_id UUID default gen_random_uuid(),
	manager_name TEXT NOT NULL,
	manager_email TEXT NOT NULL,
	manager_password TEXT NOT NULL,
	manager_verified BOOLEAN DEFAULT false
);