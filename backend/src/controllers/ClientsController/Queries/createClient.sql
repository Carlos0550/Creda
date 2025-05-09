SELECT COUNT(*) FROM clients WHERE client_id = $1;

INSERT INTO clients(
    client_id,
    client_credit_scoring,
    client_credit_status
)VALUES(
    $1,
    $2,
    $3
);