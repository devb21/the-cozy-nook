# Create database script for The Cozy Nook

# Create the database
CREATE DATABASE IF NOT EXISTS the_cozy_nook;
USE the_cozy_nook;

# Create the app user
CREATE USER IF NOT EXISTS 'the_cozy_nook_app'@'localhost' IDENTIFIED BY 'kjuertyultyp'; 
GRANT ALL PRIVILEGES ON the_cozy_nook.* TO ' the_cozy_nook_app'@'localhost'; 



# If you are having problems then use
/*
DROP USER IF EXISTS ' the_cozy_nook_app'@'localhost';
CREATE USER 'the_cozy_nook_app'@'localhost' IDENTIFIED BY 'kjuertyultyp';
GRANT ALL PRIVILEGES ON the_cozy_nook.* TO 'the_cozy_nook_app'@'localhost';
FLUSH PRIVILEGES;
*/
-- register : username: andrew1, password: Password1

CREATE TABLE `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `firstname` varchar(100) NOT NULL,
  `lastname` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `datecreated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8;


