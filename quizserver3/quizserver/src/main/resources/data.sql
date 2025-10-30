use quiz_server_db3;

INSERT INTO roles (role_name) VALUES
('ADMIN'),
('USER');

INSERT INTO users (name, email,  password) VALUES
('creator1', 'creator1@gmail.com', '$2a$12$lm/IpzVfrWjRWzMInO.cZuGwJHueFv3/j4ilhb6GxIuREiYdgLuYi'),
('creator2', 'creator2@gmail.com', '$2a$12$BLHUKdTVkxdTnUPCVi5g1uOpBbMbPwyp7FhBsNATk7zssNddSriEK'),
('player1', 'player1@gmail.com', '$2a$12$J0FU9PagalJ/EXevLl.JjOhTKI5gCsoB.q3dT/tvwMkyjqQthUBKC'),
('player2', 'player2@gmail.com', '$2a$12$y00qDK/A5jdRY0r/ptrBu.W8yJHGA.U32t6tvqmaBr1iYePWbbxhi'),
('player3', 'player3@gmail.com', '$2a$12$Z3e8w6iCXCVic5dVg3yWCufwoeUEUmvJx058k7DvOrNtlp11G0UJ2');

INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1),
(2, 1),
-- Regular users
(3, 2),
(4, 2),
(5, 2);
