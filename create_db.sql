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
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8;


/*
CREATE TABLE `cart` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned DEFAULT NULL,
  `user_session_id` char(32) DEFAULT NULL,
  `product_type` enum('books') NOT NULL,
  `product_id` int(10) unsigned DEFAULT NULL,
  `quantity` tinyint(3) unsigned NOT NULL,
  `date_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `date_modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_type` (`product_type`, `product_id`),
  KEY `user_session_id` (`user_session_id`),
  KEY `user_id` (`user_id`),  -- This index is enough
  KEY `idx_product_id` (`product_id`),
  CONSTRAINT `fk_cart_books` FOREIGN KEY (`product_id`) REFERENCES `books` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cart_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
*/

/*
CREATE TABLE `cart` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned DEFAULT NULL,
  `product_type` enum('books') DEFAULT NULL,
  `product_id` int(10) unsigned DEFAULT NULL,
  `quantity` int(10) DEFAULT '1',
  `date_created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `date_modified` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_session_id` char(32) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_user_session_id` (`user_session_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8;
*/



CREATE TABLE `cart` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned DEFAULT NULL COMMENT 'References the user ID',
  `book_id` int(10) unsigned NOT NULL COMMENT 'References the book ID',
  `quantity` int(10) DEFAULT '1' COMMENT 'Quantity of the book',
  `date_created` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when the cart entry was created',
  `date_modified` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Timestamp when the cart entry was last modified',
  `user_session_id` char(32) DEFAULT NULL COMMENT 'Session ID for unauthenticated users',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_session_id_book` (`user_session_id`,`book_id`),
  KEY `idx_book_id` (`book_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_book_id` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=686 DEFAULT CHARSET=utf8 COMMENT='Stores cart items for users or sessions';


CREATE TABLE `customers` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `email` varchar(80) NOT NULL,
  `first_name` varchar(20) NOT NULL,
  `last_name` varchar(40) NOT NULL,
  `address1` varchar(80) NOT NULL,
  `address2` varchar(80) DEFAULT NULL,
  `city` varchar(60) NOT NULL,
  `post_code` mediumint(5) unsigned zerofill NOT NULL,
  `phone` char(10) NOT NULL,
  `date_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `fk_customers_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8;




CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `order_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(50) DEFAULT 'Pending',
  `total` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8;




CREATE TABLE `order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `book_id` int(10) unsigned NOT NULL,
  `quantity` int(11) DEFAULT '1',
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `order_items_ibfk_2` (`book_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;





CREATE TABLE `sales` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `product_type` enum('books') NOT NULL,
  `product_id` int(10) unsigned NOT NULL,
  `discount_price` decimal(10,2) NOT NULL,
  `original_price` decimal(10,2) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_start_date` (`product_type`,`product_id`,`start_date`),
  KEY `end_date` (`end_date`),
  KEY `fk_sales_books` (`product_id`),
  CONSTRAINT `fk_sales_books` FOREIGN KEY (`product_id`) REFERENCES `books` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8;



CREATE TABLE `reviews` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `product_type` enum('books') NOT NULL,
  `product_id` int(10) unsigned NOT NULL,
  `user_id` int(10) unsigned NOT NULL,
  `review` text NOT NULL,
  `rating` tinyint(1) unsigned NOT NULL,
  `date_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`,`product_id`),
  KEY `product_type` (`product_type`,`product_id`),
  KEY `fk_reviews_books` (`product_id`),
  CONSTRAINT `fk_reviews_books` FOREIGN KEY (`product_id`) REFERENCES `books` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_reviews_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



CREATE TABLE `transactions` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `type` varchar(18) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `response_code` tinyint(1) NOT NULL,
  `response_reason` tinytext,
  `transaction_id` bigint(20) unsigned NOT NULL,
  `response` text NOT NULL,
  `date_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;




CREATE TABLE `wish_lists` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `product_type` enum('books') NOT NULL,
  `product_id` int(10) unsigned NOT NULL,
  `quantity` tinyint(3) unsigned NOT NULL DEFAULT '1',
  `date_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `date_modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_type` (`product_type`,`product_id`),
  KEY `user_id` (`user_id`),
  KEY `fk_wishlists_books` (`product_id`),
  CONSTRAINT `fk_wishlists_books` FOREIGN KEY (`product_id`) REFERENCES `books` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_wishlists_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8;


/************** stored procedures ****************************************/


DELIMITER $$

CREATE PROCEDURE `sp_authenticate_user`(
    IN p_username VARCHAR(255),
    IN p_email VARCHAR(255)
)
BEGIN
    -- Select the user by username or email
    SELECT username, password, firstname 
    FROM users
    WHERE username = p_username OR email = p_email;
END$$

DELIMITER ;






DELIMITER $$
CREATE PROCEDURE `sp_authenticate_user`(
    IN p_username VARCHAR(255),
    IN p_email VARCHAR(255)
)
BEGIN
    -- Select the user by username or email
    SELECT id, username, firstname, lastname, email, password 
    FROM users
    WHERE username = p_username OR email = p_email;
END$$

DELIMITER ;


DELIMITER $$
CREATE PROCEDURE `sp_login_user`(
    IN p_username VARCHAR(255),
    IN p_email VARCHAR(255)
)
BEGIN
    -- Select user by username or email
    SELECT * 
    FROM users 
    WHERE username = p_username OR email = p_email;
END$$
DELIMITER ;




DELIMITER $$

CREATE PROCEDURE `sp_register_user`(
    IN p_username VARCHAR(255),
    IN p_firstname VARCHAR(255),
    IN p_lastname VARCHAR(255),
    IN p_email VARCHAR(255),
    IN p_password VARCHAR(255)
)
BEGIN
    -- Check if username already exists
    IF EXISTS (SELECT 1 FROM users WHERE username = p_username) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Username already exists';
    END IF;

    -- Check if email already exists
    IF EXISTS (SELECT 1 FROM users WHERE email = p_email) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Email already exists';
    END IF;

    -- Insert the new user into the users table
    INSERT INTO users (username, firstname, lastname, email, password) 
    VALUES (p_username, p_firstname, p_lastname, p_email, p_password);
END$$

DELIMITER ;




DELIMITER $$

CREATE PROCEDURE SearchBooks(IN searchTerm VARCHAR(255))
BEGIN
    SELECT 
        books.id AS book_id,
        books.title AS book_title,
        books.genre,
        books.image_url,
        books.price,
        authors.name AS author_name,
        publisher.name AS publisher_name
    FROM books
    LEFT JOIN authors ON books.author_id = authors.id
    LEFT JOIN publisher ON books.publisher_id = publisher.id
    WHERE books.title LIKE CONCAT(searchTerm, '%');
END $$

DELIMITER ;



DELIMITER $$

CREATE PROCEDURE SearchAuthors(IN searchTerm VARCHAR(255))
BEGIN
    SELECT 
        books.id AS book_id,
        books.title AS book_title,
        books.genre,
        books.image_url,
        books.price,
        authors.name AS author_name,
        publisher.name AS publisher_name
    FROM books
    LEFT JOIN authors ON books.author_id = authors.id
    LEFT JOIN publisher ON books.publisher_id = publisher.id
    WHERE authors.name LIKE CONCAT(searchTerm, '%');
END $$

DELIMITER ;




DELIMITER $$

CREATE PROCEDURE SearchPublishers(IN searchTerm VARCHAR(255))
BEGIN
    SELECT 
        books.id AS book_id,
        books.title AS book_title,
        books.genre,
        books.image_url,
        books.price,
        authors.name AS author_name,
        publisher.name AS publisher_name
    FROM books
    LEFT JOIN authors ON books.author_id = authors.id
    LEFT JOIN publisher ON books.publisher_id = publisher.id
    WHERE publisher.name LIKE CONCAT(searchTerm, '%');
END $$

DELIMITER ;


DELIMITER $$

CREATE PROCEDURE GetAllBooks()
BEGIN
    SELECT 
        books.id AS book_id,
        books.title AS book_title,
        books.genre,
        books.image_url,
        books.price,
        authors.name AS author_name,
        publisher.name AS publisher_name
    FROM books
    LEFT JOIN authors ON books.author_id = authors.id
    LEFT JOIN publisher ON books.publisher_id = publisher.id;
END $$

DELIMITER ;



DELIMITER $$

CREATE PROCEDURE GetBookDetails(IN bookId INT)
BEGIN
    SELECT 
        books.id AS book_id,
        books.title AS book_title,
        books.genre,
        books.image_url,
        books.price,
        books.summary AS book_bio,
        authors.name AS author_name,
        publisher.name AS publisher_name
    FROM books
    LEFT JOIN authors ON books.author_id = authors.id
    LEFT JOIN publisher ON books.publisher_id = publisher.id
    WHERE books.id = bookId;
END $$

DELIMITER ;



DELIMITER $$

CREATE PROCEDURE CheckCartItem(
    IN p_user_id INT, 
    IN p_book_id INT
)
BEGIN
    SELECT id, quantity FROM cart WHERE book_id = p_book_id AND user_id = p_user_id;
END $$

DELIMITER ;



DELIMITER $$

CREATE PROCEDURE UpdateCartItem(
    IN p_cart_id INT, 
    IN p_new_quantity INT
)
BEGIN
    UPDATE cart 
    SET quantity = p_new_quantity 
    WHERE id = p_cart_id;
END $$

DELIMITER ;



DELIMITER $$

CREATE PROCEDURE InsertCartItem(
    IN p_user_id INT, 
    IN p_book_id INT
)
BEGIN
    INSERT INTO cart (user_id, book_id, quantity) 
    VALUES (p_user_id, p_book_id, 1);
END $$

DELIMITER ;



DELIMITER $$

CREATE PROCEDURE InsertSessionCartItem(
    IN p_user_session_id VARCHAR(255), 
    IN p_book_id INT
)
BEGIN
    INSERT INTO cart (user_session_id, book_id, quantity)
    VALUES (p_user_session_id, p_book_id, 1)
    ON DUPLICATE KEY UPDATE quantity = quantity + 1;
END $$

DELIMITER ;





DELIMITER $$

CREATE PROCEDURE GetCartItems(IN p_user_id INT)
BEGIN
    SELECT 
        cart.book_id,                                                                                              
        cart.quantity,                                                                                             
        books.title AS book_title,                                                                                 
        CAST(books.price AS DECIMAL(10,2)) AS price,                                                               
        books.image_url                                                                                            
    FROM cart                                                                                                      
    JOIN books ON cart.book_id = books.id                                                                          
    WHERE cart.user_id = p_user_id;  
END $$

DELIMITER ;





-- Stored Procedure for Logged-in Users
DELIMITER //

CREATE PROCEDURE MoveToCartForUser(
    IN p_user_id INT,
    IN p_book_id INT
)
BEGIN
    DECLARE v_quantity INT DEFAULT 1;

    -- Get the quantity from the wishlist
    SELECT quantity INTO v_quantity
    FROM wish_lists
    WHERE user_id = p_user_id AND book_id = p_book_id
    LIMIT 1;

    -- Insert into cart or update the quantity if already present
    INSERT INTO cart (user_id, book_id, quantity)
    VALUES (p_user_id, p_book_id, v_quantity)
    ON DUPLICATE KEY UPDATE quantity = quantity + v_quantity;

    -- Remove from wishlist
    DELETE FROM wish_lists WHERE user_id = p_user_id AND book_id = p_book_id;
END //

DELIMITER ;

-- Stored Procedure for Session-Based Users
DELIMITER //

CREATE PROCEDURE MoveToCartForSession(
    IN p_session_id VARCHAR(255),
    IN p_book_id INT,
    IN p_quantity INT
)
BEGIN
    -- Remove from wishlist
    DELETE FROM wish_lists WHERE user_session_id = p_session_id AND book_id = p_book_id;

    -- Insert into cart or update the quantity if already present
    INSERT INTO cart (user_session_id, book_id, quantity)
    VALUES (p_session_id, p_book_id, p_quantity)
    ON DUPLICATE KEY UPDATE quantity = quantity + p_quantity;
END //

DELIMITER ;





DELIMITER $$

CREATE PROCEDURE remove_item_from_cart_logged_in(IN user_id INT, IN book_id INT)
BEGIN
    DELETE FROM cart
    WHERE user_id = user_id AND book_id = book_id;
END $$

DELIMITER ;


DELIMITER $$

CREATE PROCEDURE remove_item_from_cart_session(IN user_session_id VARCHAR(255), IN book_id INT)
BEGIN
    DELETE FROM cart
    WHERE user_session_id = user_session_id AND book_id = book_id;
END $$

DELIMITER ;




DELIMITER $$

CREATE PROCEDURE update_cart_logged_in(
    IN p_user_id INT,
    IN p_book_id INT,
    IN p_quantity INT
)
BEGIN
    UPDATE cart
    SET quantity = p_quantity
    WHERE user_id = p_user_id AND book_id = p_book_id;
END $$

DELIMITER ;



DELIMITER $$

CREATE PROCEDURE update_cart_session_based(
    IN p_user_session_id VARCHAR(255),
    IN p_book_id INT,
    IN p_quantity INT
)
BEGIN
    UPDATE cart
    SET quantity = p_quantity
    WHERE user_session_id = p_user_session_id AND book_id = p_book_id;
END $$

DELIMITER ;




-- Stored Procedure: FetchCart
DELIMITER //
CREATE PROCEDURE FetchCart(IN p_userId INT, IN p_sessionId VARCHAR(255))
BEGIN
    SELECT 
        cart.book_id, cart.quantity, books.title AS book_title, 
        CAST(books.price AS DECIMAL(10,2)) AS price, books.image_url 
    FROM cart 
    JOIN books ON cart.book_id = books.id 
    WHERE cart.user_id = p_userId OR cart.user_session_id = p_sessionId;
END //
DELIMITER ;

-- Stored Procedure: MoveItemToWishlist
DELIMITER $$
CREATE PROCEDURE MoveItemToWishlist(IN p_userId INT, IN p_sessionId VARCHAR(255), IN p_bookId INT, IN p_quantity INT)
BEGIN
    -- Move item from cart to wishlist
    INSERT INTO wish_lists (user_id, user_session_id, book_id, quantity)
    VALUES (p_userId, p_sessionId, p_bookId, p_quantity)
    ON DUPLICATE KEY UPDATE quantity = quantity + p_quantity;
END $$
DELIMITER ;

-- Stored Procedure: RemoveFromCart
DELIMITER //
CREATE PROCEDURE RemoveFromCart(IN p_userId INT, IN p_sessionId VARCHAR(255), IN p_bookId INT)
BEGIN
    DELETE FROM cart WHERE (user_id = p_userId OR user_session_id = p_sessionId) AND book_id = p_bookId;
END //
DELIMITER ;
