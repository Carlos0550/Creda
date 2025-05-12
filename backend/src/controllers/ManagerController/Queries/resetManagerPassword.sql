SELECT * FROM managers WHERE manager_id = $1;

UPDATE managers SET manager_password = $1 WHERE manager_id = $2;

UPDATE recovery_manager SET used = true WHERE recovery_id = $1;