-- Schema creation for flosi application database

CREATE DATABASE IF NOT EXISTS `dataofflosi`;
USE `dataofflosi`;

-- 1. Table: users
CREATE TABLE IF NOT EXISTS `users` (
    `id_user` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL
);

-- 2. Table: rooms
CREATE TABLE IF NOT EXISTS `rooms` (
    `id_room` VARCHAR(50) PRIMARY KEY,
    `room_name` VARCHAR(255) NOT NULL,
    `room_length_personne` INT NOT NULL,
    `id_admin_user` INT NOT NULL,
    FOREIGN KEY (`id_admin_user`) REFERENCES `users`(`id_user`) ON DELETE CASCADE
);

-- 3. Table: f_inveted
CREATE TABLE IF NOT EXISTS `f_inveted` (
    `id_inveted` INT AUTO_INCREMENT PRIMARY KEY,
    `name_inveted` VARCHAR(255) NOT NULL,
    `id_room_inveted` VARCHAR(50) NOT NULL,
    FOREIGN KEY (`id_room_inveted`) REFERENCES `rooms`(`id_room`) ON DELETE CASCADE
);
