CREATE TABLE managers(
	manager_id UUID default gen_random_uuid(),
	manager_name TEXT NOT NULL,
	manager_email TEXT NOT NULL,
	manager_password TEXT NOT NULL,
	manager_verified BOOLEAN DEFAULT false
);

CREATE TYPE credit_status_types AS ENUM('good', 'bad');
CREATE TABLE clients(
	client_id TEXT NOT NULL UNIQUE PRIMARY KEY,
	client_credit_scoring NUMERIC,
	client_credit_status credit_status_types
);
