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

CREATE TABLE `publisher` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `address` text,
  `contact_email` varchar(255) DEFAULT NULL,
  `website_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8;



CREATE TABLE `authors` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `bio` text,
  `date_of_birth` date DEFAULT NULL,
  `date_of_death` date DEFAULT NULL,
  `publisher_id` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_author_publisher` (`publisher_id`),
  CONSTRAINT `fk_author_publisher` FOREIGN KEY (`publisher_id`) REFERENCES `publisher` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8;



CREATE TABLE `books` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `genre` varchar(100) DEFAULT NULL,
  `publication_date` date DEFAULT NULL,
  `isbn` varchar(13) NOT NULL,
  `page_count` int(10) unsigned DEFAULT NULL,
  `summary` text,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `image_url` varchar(255) DEFAULT NULL,
  `author_id` int(10) unsigned NOT NULL,
  `publisher_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `isbn` (`isbn`),
  KEY `idx_author_id` (`author_id`),
  KEY `idx_publisher_id` (`publisher_id`),
  CONSTRAINT `books_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `authors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `books_ibfk_2` FOREIGN KEY (`publisher_id`) REFERENCES `publisher` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8;


