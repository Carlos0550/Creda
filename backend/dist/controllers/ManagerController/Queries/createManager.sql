SELECT COUNT(*) FROM managers WHERE manager_email = $1;

INSERT INTO managers(
    manager_name,
    manager_email,
    manager_password
)VALUES(
    $1,
    $2,
    $3
) RETURNING manager_id;