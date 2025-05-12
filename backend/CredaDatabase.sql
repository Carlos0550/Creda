CREATE TABLE managers(
	manager_id UUID default gen_random_uuid() PRIMARY KEY,
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

CREATE TABLE recovery_manager (
  recovery_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  manager_id UUID NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  CONSTRAINT fk_recovery_manager_id FOREIGN KEY (manager_id) REFERENCES managers(manager_id)
);
