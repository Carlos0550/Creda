SELECT COUNT(*) FROM users WHERE user_email = $1;

INSERT INTO users(
    user_name,
    user_email,
    user_password
) VALUES(
    $1,$2,$3
);