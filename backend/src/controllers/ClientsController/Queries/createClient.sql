SELECT COUNT(*) FROM clients WHERE client_id = $1;

INSERT INTO clients(
    client_name,
    client_nationality,
    client_id
)VALUES(
    $1,
    $2,
    $3
) RETURNING client_id;