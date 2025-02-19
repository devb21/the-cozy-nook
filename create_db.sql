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




/*****************INSERT into publisher *************************************************/


INSERT INTO `publisher` (`name`, `address`, `contact_email`, `website_url`) VALUES
('Penguin Random House', '1745 Broadway, New York, NY 10019', 'contact@penguinrandomhouse.com', 'https://www.penguinrandomhouse.com'),
('HarperCollins', '195 Broadway, New York, NY 10007', 'info@harpercollins.com', 'https://www.harpercollins.com'),
('Hachette Book Group', '1290 Avenue of the Americas, New York, NY 10104', 'info@hachettebookgroup.com', 'https://www.hachettebookgroup.com'),
('Simon & Schuster', '1230 Avenue of the Americas, New York, NY 10020', 'customer.service@simonandschuster.com', 'https://www.simonandschuster.com'),
('Macmillan', '120 Broadway, New York, NY 10271', 'info@macmillan.com', 'https://www.macmillan.com');


INSERT INTO `publisher` (`id`, `name`, `address`, `contact_email`, `website_url`) VALUES
(6, 'Tor Books', 'New York, NY, USA', 'contact@tor.com', 'https://www.tor.com'),
(7, 'Head of Zeus', 'London, UK', 'info@headofzeus.com', 'https://www.headofzeus.com');


/******************insert into authors ************************************/


INSERT INTO authors (name, bio, date_of_birth, date_of_death, publisher_id) VALUES

("A. E. Ashford","A. E. Ashford was a celebrated fantasy novelist known for her work on magical realms and ancient prophecies. Born in 1954, she started her writing career in the late 1980s and became a beloved figure in the literary world.",'1954-05-12', '2020-10-14' ,1),
("Benjamin R. Caldwell","Benjamin R. Caldwell was an American author who spent decades exploring the mysteries of the universe through science fiction. His works, often set in dystopian futures, have earned him several literary awards.", '1963-02-25', '2021-03-04' ,1),
("Charlotte M. Graves","Charlotte M. Graves was an English writer and poet, famous for her poignant explorations of love, loss, and identity in the modern world. Her literary career spanned over four decades, beginning in the 1970s.",'1947-09-10', '2022-11-22' ,1),
("Douglas H. Fraser","A renowned historian, Douglas H. Fraser authored multiple books on European history during the Renaissance. His works are considered essential reading for students and scholars of the period.", '1960-03-17', NULL, 1),
("Ella Monroe","Ella Monroe is a prolific author of psychological thrillers. Known for her dark, twist-filled plots, she has been praised for her ability to keep readers on the edge of their seats.", '1982-06-28', NULL, 1),
("Fletcher N. Wills","Fletcher N. Wills was a celebrated crime fiction author who focused on gritty, noir-style detective stories. His writing is renowned for its intricate plots and rich character development.",'1970-04-05', '2019-08-21', 1),
("Gina T. Morgan","A gifted writer of historical fiction, Gina T. Morgan’s books bring to life the untold stories of ordinary people during key moments in history, particularly World War II and the Victorian era.", '1980-01-15', NULL, 1),
("Hector D. Kennedy","Hector D. Kennedy was an Australian author, famous for his unique style of blending literary fiction with elements of magical realism. He often explored themes of spirituality and personal growth in his work.", '1955-11-02', '2021-06-19', 1),
("Iris V. Holden","A British author, Iris V. Holden wrote extensively about the British upper class in the 19th century. Her novels often explored social class and personal ambition.", '1949-07-08', '2020-01-03', 1),
("Jacklyn P. Foster","Jacklyn P. Foster was a science fiction author known for her intricate world-building and exploration of alien cultures. Her debut novel was a bestseller and earned her a place among the greats of the genre.", '1975-12-23', '2018-12-12', 1),
("Kurt B. Larson","Kurt B. Larson was an American mystery writer whose detective novels focused on unsolved crimes in small-town settings. His writing has been compared to that of Agatha Christie and Arthur Conan Doyle.", '1968-09-04', '2017-02-28', 1),
("Lena R. Fields","Lena R. Fields was a celebrated author of contemporary romance novels. Her books often explored the complexities of modern relationships, particularly those affected by technology and social media.", '1985-05-17', NULL, 1),
("Maggie C. Turner","Maggie C. Turner was known for her novels focusing on survival stories. Set in extreme conditions, her books often pushed characters to their physical and emotional limits.", '1972-02-11', NULL, 1),
("Nate T. Carlisle","A pioneer in the genre of alternate history, Nate T. Carlisle is known for his vivid depictions of what the world might look like had pivotal events unfolded differently. His work challenges the perceptions of history.", '1980-11-30', '2023-06-13', 1),
("Olivia J. White","Olivia J. White wrote several best-selling memoirs about overcoming adversity. Her deeply personal stories have inspired readers worldwide to pursue their dreams despite obstacles.", '1990-04-08', NULL, 1),
("Peter F. Salazar","Peter F. Salazar was a Latin American author who spent his life documenting the complex realities of life in his home country. His novels and essays shed light on the socio-political challenges facing modern-day Latin America.", '1961-01-21', '2022-07-04', 1),
("Quincy L. Davidson","Quincy L. Davidson was a celebrated historical fiction writer whose works span multiple eras, from Ancient Greece to the American Civil War. He was known for his meticulous research and storytelling skills.",'1953-10-03', '2019-01-25', 1),
("Rita P. Knight","Rita P. Knight wrote bestselling mystery novels, particularly within the cozy subgenre. Her books often featured strong, female protagonists solving crimes in picturesque, small towns.", '1978-03-29', '2021-04-17', 1),
("Samuel G. Owens","Samuel G. Owens was a science fiction author who became famous for his dystopian novels that explore themes of environmental collapse and the survival of humanity in a post-apocalyptic world.", '1966-12-13', '2020-09-19', 1),
("Tessa D. Bright","Tessa D. Bright was a young and talented writer known for her ability to weave dark fantasy with elements of horror. Her works are praised for their imaginative settings and unique creatures.", '1992-07-30', NULL, 1),
("Ursula P. Brooks","Ursula P. Brooks became a renowned figure in the historical romance genre with her books that depict the lives of strong women in Regency-era England. Her works are marked by elegant prose and poignant social commentary.", '1970-05-22', NULL, 2),
("Victor M. Gray","Victor M. Gray wrote psychological thrillers that delve into the darkest corners of the human mind. His novels, often featuring unreliable narrators, have earned him a devoted following.", '1969-09-09', '2023-03-11', 2),
("Wendy J. Baldwin","Wendy J. Baldwin was a famous author of young adult fiction, especially known for her coming-of-age novels. Her books often tackled difficult topics such as grief, friendship, and identity in the modern world.", '1983-01-04', NULL, 2),
("Xander L. Finley","Xander L. Finley was a writer of speculative fiction, known for his high-octane action scenes and philosophical undertones. His books often explore the nature of reality and the future of humanity.", '1991-05-16', NULL, 2),
("Yvonne C. Bennett","Yvonne C. Bennett was a renowned literary critic and author who published several essays and books analyzing the role of gender and identity in contemporary literature.", '1964-02-28','2021-07-30', 2),
("Zane K. Fox","Zane K. Fox was a well-known thriller novelist whose suspense-filled stories kept readers at the edge of their seats. His focus was on crime stories set in gritty urban settings.", '1977-08-11', NULL, 2),
("A. E. Ashford","A. E. Ashford was a celebrated fantasy novelist known for her work on magical realms and ancient prophecies. Born in 1954, she started her writing career in the late 1980s and became a beloved figure in the literary world.", '1954-05-12', '2020-10-14', 2),
("Benjamin R. Caldwell","Benjamin R. Caldwell was an American author who spent decades exploring the mysteries of the universe through science fiction. His works, often set in dystopian futures, have earned him several literary awards.", '1963-02-25', '2021-03-04', 2),
("Charlotte M. Graves","Charlotte M. Graves was an English writer and poet, famous for her poignant explorations of love, loss, and identity in the modern world. Her literary career spanned over four decades, beginning in the 1970s.", '1947-09-10', '2022-11-22', 2),
("Douglas H. Fraser","A renowned historian, Douglas H. Fraser authored multiple books on European history during the Renaissance. His works are considered essential reading for students and scholars of the period.", '1960-03-17', NULL, 2),
("Ella Monroe","Ella Monroe is a prolific author of psychological thrillers. Known for her dark, twist-filled plots, she has been praised for her ability to keep readers on the edge of their seats.", '1982-06-28', NULL, 2),
("Fletcher N. Wills","Fletcher N. Wills was a celebrated crime fiction author who focused on gritty, noir-style detective stories. His writing is renowned for its intricate plots and rich character development.", '1970-04-05', '2019-08-21', 2),
("Gina T. Morgan","A gifted writer of historical fiction, Gina T. Morgan’s books bring to life the untold stories of ordinary people during key moments in history, particularly World War II and the Victorian era.", '1980-01-15', NULL, 2),
("Hector D. Kennedy","Hector D. Kennedy was an Australian author, famous for his unique style of blending literary fiction with elements of magical realism. He often explored themes of spirituality and personal growth in his work.", '1955-11-02', '2021-06-19', 2),
("Iris V. Holden","A British author, Iris V. Holden wrote extensively about the British upper class in the 19th century. Her novels often explored social class and personal ambition.", '1949-07-08', '2020-01-03', 2),
("Jacklyn P. Foster","Jacklyn P. Foster was a science fiction author known for her intricate world-building and exploration of alien cultures. Her debut novel was a bestseller and earned her a place among the greats of the genre.", '1975-12-23', '2018-12-12', 2),
("Kurt B. Larson","Kurt B. Larson was an American mystery writer whose detective novels focused on unsolved crimes in small-town settings. His writing has been compared to that of Agatha Christie and Arthur Conan Doyle.", '1968-09-04', '2017-02-28', 2),
("Lena R. Fields","Lena R. Fields was a celebrated author of contemporary romance novels. Her books often explored the complexities of modern relationships, particularly those affected by technology and social media.", '1985-05-17', NULL, 2),
("Maggie C. Turner","Maggie C. Turner was known for her novels focusing on survival stories. Set in extreme conditions, her books often pushed characters to their physical and emotional limits.", '1972-02-11', NULL, 2),
("Nate T. Carlisle","A pioneer in the genre of alternate history, Nate T. Carlisle is known for his vivid depictions of what the world might look like had pivotal events unfolded differently. His work challenges the perceptions of history.", '1980-11-30', '2023-06-13', 2),
("Olivia J. White","Olivia J. White wrote several best-selling memoirs about overcoming adversity. Her deeply personal stories have inspired readers worldwide to pursue their dreams despite obstacles.", '1990-04-08', NULL, 3),
("Peter F. Salazar","Peter F. Salazar was a Latin American author who spent his life documenting the complex realities of life in his home country. His novels and essays shed light on the socio-political challenges facing modern-day Latin America.", '1961-01-21', '2022-07-04', 3),
("Quincy L. Davidson","Quincy L. Davidson was a celebrated historical fiction writer whose works span multiple eras, from Ancient Greece to the American Civil War. He was known for his meticulous research and storytelling skills.", '1953-10-03', '2019-01-25', 3),
("Rita P. Knight","Rita P. Knight wrote bestselling mystery novels, particularly within the cozy subgenre. Her books often featured strong, female protagonists solving crimes in picturesque, small towns.", '1978-03-29', '2021-04-17', 3),
("Samuel G. Owens","Samuel G. Owens was a science fiction author who became famous for his dystopian novels that explore themes of environmental collapse and the survival of humanity in a post-apocalyptic world.", '1966-12-13', '2020-09-19', 3),
("Tessa D. Bright","Tessa D. Bright was a young and talented writer known for her ability to weave dark fantasy with elements of horror. Her works are praised for their imaginative settings and unique creatures.", '1992-07-30', NULL, 3),
("Ursula P. Brooks","Ursula P. Brooks became a renowned figure in the historical romance genre with her books that depict the lives of strong women in Regency-era England. Her works are marked by elegant prose and poignant social commentary.", '1970-05-22', NULL, 3),
("Victor M. Gray","Victor M. Gray wrote psychological thrillers that delve into the darkest corners of the human mind. His novels, often featuring unreliable narrators, have earned him a devoted following.", '1969-09-09', '2023-03-11', 3),
("Wendy J. Baldwin","Wendy J. Baldwin was a famous author of young adult fiction, especially known for her coming-of-age novels. Her books often tackled difficult topics such as grief, friendship, and identity in the modern world.", '1983-01-04', NULL, 3),
("Xander L. Finley","Xander L. Finley was a writer of speculative fiction, known for his high-octane action scenes and philosophical undertones. His books often explore the nature of reality and the future of humanity.", '1991-05-16', NULL, 3),
("Yvonne C. Bennett","Yvonne C. Bennett was a renowned literary critic and author who published several essays and books analyzing the role of gender and identity in contemporary literature.", '1964-02-28', '2021-07-30', 3),
("Zane K. Fox","Zane K. Fox was a well-known thriller novelist whose suspense-filled stories kept readers at the edge of their seats. His focus was on crime stories set in gritty urban settings.", '1977-08-11', NULL, 3),
("Amelia D. Shaw","Amelia D. Shaw was a master of gothic literature, crafting chilling narratives filled with mystery and eerie atmospheres. Her works are often set in decaying estates and haunted mansions.", '1962-05-01', '2022-08-05', 3),
("Benedict J. Clarke","Benedict J. Clarke was a prominent author of adventure novels set in the colonial era. His books depict the thrilling escapades of explorers charting unknown territories across the globe.", '1958-12-07', '2017-03-14', 3),
("Catherine L. Roberts","Catherine L. Roberts wrote emotionally powerful dramas focused on family struggles, particularly highlighting generational conflicts and the complexities of parental relationships.", '1974-10-15', '2023-09-10', 3),
("David F. Shaw","David F. Shaw is a British author known for his gripping espionage thrillers, often exploring themes of trust, deception, and political intrigue within international spy networks.", '1988-03-21', NULL, 3),
("Eva K. Palmer","Eva K. Palmer was a beloved author of historical romance novels, particularly set in the Victorian era. Her works captured the social dynamics of the time and were known for their complex, relatable characters.", '1970-11-28', '2021-01-30', 3),
("Frankie B. Stone","Frankie B. Stone’s novels span multiple genres, including horror, fantasy, and science fiction. His writing is known for its dark humor and sharp social commentary.", '1984-07-16', NULL, 3),
("Gillian T. Fraser","Gillian T. Fraser became famous for her hard-hitting contemporary fiction, dealing with the struggles of young adults growing up in challenging social environments.", '1991-06-30', NULL, 3),
("Harry L. Grayson","Harry L. Grayson wrote fast-paced thrillers focused on modern warfare and espionage. His novels explore the moral dilemmas faced by soldiers and spies in conflict zones.", '1962-09-24', '2022-02-18', 3),
("Isla M. Dawson","Isla M. Dawson writes fantasy novels featuring magical creatures and ancient prophecies. Her richly imagined worlds are often influenced by her deep love for mythology.", '1986-04-06', NULL, 4),
("James K. Lawson","James K. Lawson is an influential literary critic and historian who focuses on the evolution of modern literature. He has published numerous essays examining the relationship between literature and politics.", '1954-03-14', '2020-06-12', 4),
("Katherine R. Stark","Katherine R. Stark was an author known for her powerful psychological thrillers. Her books often explore the complex relationship between memory, identity, and trauma.", '1967-12-03', '2021-09-11', 4),
("Liam J. Carter","Liam J. Carter writes action-packed military science fiction novels set in the future, often focusing on space warfare and human conflict in distant galaxies.", '1980-09-10', NULL, 4),
("Mona V. Wells","Mona V. Wells was a renowned author of coming-of-age novels, her works often focusing on the internal struggles of young people navigating difficult situations.", '1995-04-27', NULL, 4),
("Noah E. Pierce","Noah E. Pierce is an acclaimed horror writer, known for his chilling ghost stories and supernatural thrillers. His works are often set in isolated towns and haunted locations.", '1972-11-10', '2020-02-02', 4),
("Olivia R. Mason","Olivia R. Mason writes contemporary romance novels that often revolve around themes of second chances and rekindled love. Her characters are known for their emotional depth and growth.", '1983-01-18', NULL, 4),
("Penny J. Archer","Penny J. Archer is a prolific author of cozy mystery novels, often set in small towns. Her books feature amateur sleuths who uncover deep secrets within their seemingly idyllic communities.", '1964-07-23', NULL, 4),
("Quinton F. Harris","Quinton F. Harris is a sci-fi and fantasy writer, his works focusing on themes of time travel, parallel universes, and the ethical implications of altering history.", '1981-12-06', '2022-04-19', 4),
("Rebecca L. Pierce","Rebecca L. Pierce writes historical fiction, often focusing on women’s roles in shaping major historical events. Her characters are brave, resilient, and often defy societal expectations.", '1979-05-11', NULL, 4),
("Stephen D. Sinclair","Stephen D. Sinclair is known for his dark fantasy novels set in medieval worlds filled with magic, political intrigue, and epic battles. His books are known for their complex characters and brutal landscapes.", '1975-08-22', '2023-12-04', 4),
("Tara J. Finley","Tara J. Finley is a young adult author known for her exploration of identity and relationships in her books. Her stories often explore personal growth through hardships.", '1993-02-19', NULL, 4),
("Alexander V. Crane","Alexander V. Crane was a British historian known for his comprehensive works on the Napoleonic Wars and their cultural impact.", '1959-08-14', '2023-05-09', 4),
("Beatrice L. Harlow","Beatrice L. Harlow is a bestselling author of contemporary women’s fiction, exploring themes of friendship, love, and self-discovery.", '1987-03-08', NULL, 4),
("Cameron D. Lowe","Cameron D. Lowe was an American poet and novelist whose introspective works often dealt with the struggles of mental health.", '1965-06-24', '2020-11-11', 4),
("Daphne E. Shaw","Daphne E. Shaw is an environmental activist and writer, known for her nonfiction works on climate change and conservation.", '1978-10-19', NULL, 4),
("Edgar B. Ford","Edgar B. Ford wrote compelling adventure novels, often set in the rugged American West. His works celebrated the pioneer spirit.", '1956-02-03', '2019-09-27', 4),
("Francesca J. Moreno","Francesca J. Moreno was a Latinx author celebrated for her poignant novels that explore the immigrant experience in America.", '1971-12-29', '2021-05-15', 4),
("Gregory H. Lane","Gregory H. Lane is a renowned science fiction author whose works delve into artificial intelligence and the ethics of technological progress.", '1985-07-04', NULL, 4),
("Hannah K. Rhodes","Hannah K. Rhodes was a celebrated poet and short story writer, known for her evocative depictions of rural life and natural beauty.", '1948-01-18', '2017-12-23', 4),
("Isaac T. Cooper","Isaac T. Cooper was a thriller novelist whose works often revolved around high-stakes political conspiracies and espionage.", '1963-04-14', '2022-03-18', 5),
("Jane V. Dalton","Jane V. Dalton is a contemporary author specializing in legal dramas and courtroom thrillers, praised for their authenticity.", '1980-09-22', NULL, 5),
("Kenneth M. Boyd","Kenneth M. Boyd wrote groundbreaking speculative fiction, blending cyberpunk elements with traditional noir storytelling.", '1975-10-01', '2020-08-07', 5),
("Lila R. Weston","Lila R. Weston was a renowned biographer, chronicling the lives of influential artists and political figures.", '1952-03-09', '2018-05-25', 5),
("Marcus C. Donovan","Marcus C. Donovan is a prolific author of graphic novels, known for their intricate plots and visually stunning illustrations.", '1988-11-15', NULL, 5),
("Nina P. Eastwood","Nina P. Eastwood was a celebrated children’s author whose whimsical stories enchanted generations of young readers.", '1945-06-02', '2016-09-29', 5),
("Oscar L. Foster","Oscar L. Foster wrote captivating historical thrillers set in ancient Rome, exploring political intrigue and betrayal.", '1974-05-12', '2022-12-01', 5),
("Phoebe J. Hart","Phoebe J. Hart is a celebrated novelist and essayist, known for her lyrical prose and deep explorations of family dynamics.", '1981-01-25', NULL, 5),
("Quentin M. Burke","Quentin M. Burke was a respected academic and author, publishing numerous books on 20th-century European history.", '1950-10-28', '2019-07-14', 5),
("Rosalind V. Gray","Rosalind V. Gray is an acclaimed writer of paranormal romance, blending gothic atmospheres with modern love stories.", '1987-04-11', NULL, 5),
("Santiago E. Lopez","Santiago E. Lopez wrote powerful novels about the intersection of identity, culture, and politics in Latin America.", '1969-02-21', '2021-10-03', 5),
("Theresa D. Vaughn","Theresa D. Vaughn is an award-winning poet, celebrated for her works exploring themes of resilience and personal triumph.", '1990-08-18', NULL, 5),
("Ulysses P. Carter","Ulysses P. Carter was a trailblazing African-American novelist, focusing on the struggles and achievements of the Black community.", '1957-11-04', '2018-06-20', 5),
("Veronica S. Blake","Veronica S. Blake is a bestselling romance novelist, known for her epic love stories set in exotic locales.", '1982-12-14', NULL, 5),
("Walter J. Quinn","Walter J. Quinn wrote gripping war novels inspired by his own experiences as a soldier in the Gulf War.", '1966-05-17', '2023-02-10', 5),
("Xenia L. Harper","Xenia L. Harper is a contemporary writer of speculative fiction, known for her richly imaginative worlds and innovative storytelling.", '1993-09-06', NULL, 5),
("Yasmine T. Clarke","Yasmine T. Clarke was a renowned playwright, known for her thought-provoking dramas addressing race and gender in modern society.", '1960-07-25', '2020-12-31', 5),
("Zachary P. Woods","Zachary P. Woods is an acclaimed science fiction and fantasy author, exploring humanity’s place in the universe.", '1989-06-14', NULL, 5),
("Angela D. Monroe","Angela D. Monroe wrote empowering self-help books that inspired countless readers to pursue their dreams.", '1972-10-09', NULL, 5),
("Brian T. Hayes","Brian T. Hayes is an American journalist and author, known for his incisive political commentary and investigative reporting.", '1965-03-05', NULL, 5);




INSERT INTO authors (`id`, `name`, `bio`, `date_of_birth`, `date_of_death`, `publisher_id`) VALUES
(245, 'Frank Herbert', 'Frank Herbert was an American sci-fi writer best known for *Dune*.', '1920-10-08', '1986-02-11', 6),
(246, 'Liu Cixin', 'Liu Cixin is a Chinese science fiction writer known for *The Three-Body Problem*.', '1963-06-23', NULL, 7),
(247, 'Isaac Asimov', 'Isaac Asimov was a Russian-born American writer famous for *Foundation*.', '1920-01-02', '1992-04-06', 4), 
(248, 'William Gibson', 'William Gibson is an American-Canadian sci-fi writer known for *Neuromancer*.', '1948-03-17', NULL, 2), 
(249, 'Neal Stephenson', 'Neal Stephenson is an American writer known for cyberpunk and speculative fiction.', '1959-10-31', NULL, 1), 
(250, 'Arthur C. Clarke', 'Arthur C. Clarke is a British writer known for his work on space exploration and futuristic technologies.', '1917-12-16', '2008-03-19', 6),
(251, 'Margaret Atwood', 'Margaret Atwood is a Canadian author known for her dystopian novel *The Handmaid\'s Tale*.', '1939-11-18', NULL, 7),
(252, 'Philip K. Dick', 'Philip K. Dick is an American author who explored alternate realities, identity, and consciousness in his works.', '1928-12-16', '1982-03-02', 4),
(253, 'Claudia Gray', 'Claudia Gray is a New York Times bestselling author of science fiction and fantasy books.', '1970-05-05', NULL, 2),
(254, 'Ursula K. Le Guin', 'Ursula K. Le Guin was an American author best known for her works of speculative fiction.', '1929-10-21', '2018-01-22', 1),
(255, 'Robert A. Heinlein', 'Robert A. Heinlein was an American author and a major figure in the science fiction genre.', '1907-07-07', '1988-05-08', 6),
(256, 'Orson Scott Card', 'Orson Scott Card is an American novelist best known for *Ender\'s Game*.', '1951-08-24', NULL, 7),
(257, 'Kim Stanley Robinson', 'Kim Stanley Robinson is an American author known for his works on climate change and the future of humanity.', '1952-03-23', NULL, 4),
(258, 'Ray Bradbury', 'Ray Bradbury was an American author, known for his works in science fiction and horror, including *Fahrenheit 451*.', '1920-08-22', '2012-06-05', 2),
(259, 'J.R.R. Tolkien', 'J.R.R. Tolkien is an English writer, best known for *The Hobbit* and *The Lord of the Rings*.', '1892-01-03', '1973-09-02', 1),
(260, 'George R. R. Martin', 'George R. R. Martin is an American novelist and short story writer, best known for *A Song of Ice and Fire*.', '1948-09-20', NULL, 6),
(261, 'Douglas Adams', 'Douglas Adams was an English author best known for his comedic sci-fi series *The Hitchhiker\'s Guide to the Galaxy*.', '1952-03-11', '2001-05-11', 7),
(262, 'Neil Gaiman', 'Neil Gaiman is an English author known for his works of fantasy and horror, including *American Gods* and *Coraline*.', '1960-11-10', NULL, 4),
(263, 'Terry Pratchett', 'Terry Pratchett was an English author best known for his *Discworld* series.', '1948-04-28', '2015-03-12', 2),
(264, 'Clive Barker', 'Clive Barker is an English author known for horror and fantasy fiction, including *The Hellbound Heart*.', '1952-10-05', NULL, 1);



/******************insert into books **********************************************/



BEGIN;
INSERT INTO books (title, genre, publication_date, isbn, page_count, summary, price, image_url, author_id, publisher_id) VALUES
-- Sci-Fi
('The Galactic Voyage', 'Sci-Fi', '2020-05-10', '9780001234001', 320, 'An epic journey across galaxies to save humanity.', 19.99, '/images/the_galactic_voyage.jpg', 1, 1),
('Mars Chronicles', 'Sci-Fi', '2018-07-21', '9780001234002', 290, 'A thrilling story about the colonization of Mars.', 18.49, '/images/mars_chronicles.jpg', 2, 2),
('Quantum Realm', 'Sci-Fi', '2021-09-15', '9780001234003', 350, 'A scientist discovers a way to travel through quantum realms.', 22.99, '/images/quantum_realm.jpg', 3, 3),
('Nebula Dream', 'Sci-Fi', '2023-01-01', '9780001234004', 340, 'A story of survival in deep space.', 20.99, '/images/nebula_dream.jpg', 4, 4),
('The Andromeda Signal', 'Sci-Fi', '2019-06-10', '9780001234005', 310, 'An alien signal changes the fate of Earth.', 17.49, '/images/andromeda_signal.jpg', 5, 5),
('Interstellar Awakening', 'Sci-Fi', '2022-11-15', '9780001234006', 400, 'An astronaut awakens to find Earth missing.', 21.99, '/images/interstellar_awakening.jpg', 6, 1),
('Echoes of the Future', 'Sci-Fi', '2018-03-12', '9780001234007', 290, 'Time travelers struggle to change their fate.', 19.49, '/images/echoes_of_the_future.jpg', 7, 2),
('Galactic Wars', 'Sci-Fi', '2021-08-20', '9780001234008', 500, 'An intergalactic war threatens the existence of all.', 25.99, '/images/galactic_wars.jpg', 8, 3),
('Starship Lost', 'Sci-Fi', '2020-02-10', '9780001234009', 330, 'A lost starship finds an ancient civilization.', 18.99, '/images/starship_lost.jpg', 9, 4),
('The Void Paradox', 'Sci-Fi', '2023-04-15', '9780001234010', 270, 'A paradox deep in space creates chaos.', 16.49, '/images/void_paradox.jpg', 10, 5),
('Cosmic Shift', 'Sci-Fi', '2019-12-10', '9780001234011', 280, 'A sudden shift in space alters reality.', 18.49, '/images/cosmic_shift.jpg', 11, 1),
('Planet Omega', 'Sci-Fi', '2017-07-12', '9780001234012', 410, 'Explorers face challenges on a mysterious planet.', 20.49, '/images/planet_omega.jpg', 12, 2),
('Alien Invasion', 'Sci-Fi', '2021-09-05', '9780001234013', 320, 'A gripping tale of Earth\'s resistance against aliens.', 22.99, '/images/alien_invasion.jpg', 13, 3),
('Black Hole Chronicles', 'Sci-Fi', '2020-01-25', '9780001234014', 380, 'A journey into a black hole reveals secrets.', 21.49, '/images/black_hole_chronicles.jpg', 14, 4),
('Galactic Nomads', 'Sci-Fi', '2022-05-15', '9780001234015', 370, 'Wanderers in space seek a new home.', 19.99, '/images/galactic_nomads.jpg', 15, 5),
('The Photon Sphere', 'Sci-Fi', '2018-10-30', '9780001234016', 300, 'A race to harness the energy of a dying star.', 20.99, '/images/photon_sphere.jpg', 16, 1),
('Cybernetic Rebellion', 'Sci-Fi', '2019-09-10', '9780001234017', 420, 'A rebellion led by intelligent machines.', 23.49, '/images/cybernetic_rebellion.jpg', 17, 2),
('The Singularity Project', 'Sci-Fi', '2020-03-20', '9780001234018', 360, 'Scientists accidentally create a rogue AI.', 22.49, '/images/singularity_project.jpg', 18, 3),
('Distant Horizons', 'Sci-Fi', '2023-06-18', '9780001234019', 280, 'Explorers push the limits of the universe.', 18.49, '/images/distant_horizons.jpg', 19, 4),
('Stellar Odyssey', 'Sci-Fi', '2021-11-01', '9780001234020', 440, 'A journey through the stars.', 24.99, '/images/stellar_odyssey.jpg', 20, 5),

    -- Thriller
    ('The Silent Witness', 'Thriller', '2019-03-10', '9780001234101', 400, 'A chilling murder mystery unraveling in a small town.', 17.99, '/images/the_silent_witness.jpg', 21, 2),
    ('Shadows of the Past', 'Thriller', '2017-08-12', '9780001234102', 360, 'A detective hunts for a serial killer connected to his past.', 16.99, '/images/shadows_of_the_past.jpg', 22, 1),
    ('The Last Clue', 'Thriller', '2020-10-10', '9780001234103', 300, 'A puzzle-filled hunt for a missing treasure.', 18.49, '/images/the_last_clue.jpg', 23, 4),
    ('The Forbidden Room', 'Thriller', '2022-01-15', '9780001234104', 380, 'A mystery inside an abandoned mansion.', 19.99, '/images/the_forbidden_room.jpg', 24, 3),
    ('The Assassin\'s Game', 'Thriller', '2021-06-05', '9780001234105', 410, 'A thrilling story of betrayal and espionage.', 21.49, '/images/assassins_game.jpg', 25, 5),
    ('Edge of Deception', 'Thriller', '2019-11-20', '9780001234106', 350, 'A spy thriller filled with twists and turns.', 20.49, '/images/edge_of_deception.jpg', 26, 1),
    ('Hidden Truths', 'Thriller', '2020-07-25', '9780001234107', 330, 'Uncovering secrets that were meant to stay buried.', 19.99, '/images/hidden_truths.jpg', 27, 2),
    ('The Final Countdown', 'Thriller', '2018-05-18', '9780001234108', 370, 'Race against time to prevent a catastrophe.', 22.49, '/images/the_final_countdown.jpg', 28, 3),
    ('Midnight Heist', 'Thriller', '2021-12-01', '9780001234109', 310, 'A daring heist planned under the cover of midnight.', 18.99, '/images/midnight_heist.jpg', 29, 4),
    ('Silent Shadows', 'Thriller', '2019-09-15', '9780001234110', 340, 'A thriller where nothing is as it seems.', 20.99, '/images/silent_shadows.jpg', 30, 5),
    ('The Deceptive Path', 'Thriller', '2022-04-22', '9780001234111', 290, 'Following a path filled with deceit and danger.', 19.49, '/images/the_deceptive_path.jpg', 31, 1),
    ('Whispers in the Dark', 'Thriller', '2020-02-14', '9780001234112', 320, 'Whispers lead to unexpected revelations.', 21.99, '/images/whispers_in_the_dark.jpg', 32, 2),
    ('Broken Trust', 'Thriller', '2018-08-30', '9780001234113', 360, 'Trust is shattered in this gripping thriller.', 20.49, '/images/broken_trust.jpg', 33, 3),
    ('The Hidden Agenda', 'Thriller', '2019-01-20', '9780001234114', 310, 'Uncovering the hidden motives behind actions.', 18.99, '/images/the_hidden_agenda.jpg', 34, 4),
    ('Vanishing Point', 'Thriller', '2021-10-05', '9780001234115', 280, 'A point where everything disappears.', 19.99, '/images/vanishing_point.jpg', 35, 5),
    ('Echoes of Fear', 'Thriller', '2020-06-10', '9780001234116', 330, 'Echoes of fear haunt the protagonist.', 20.99, '/images/echoes_of_fear.jpg', 36, 1),
    ('The Silent Killer', 'Thriller', '2019-04-25', '9780001234117', 370, 'A silent killer on the loose.', 22.49, '/images/the_silent_killer.jpg', 37, 2),
    ('Nightmare Alley', 'Thriller', '2022-03-18', '9780001234118', 400, 'Alleyways filled with nightmares.', 23.99, '/images/nightmare_alley.jpg', 38, 3),
    ('Hidden Lies', 'Thriller', '2021-07-30', '9780001234119', 290, 'Lies are hidden beneath the surface.', 19.99, '/images/hidden_lies.jpg', 39, 4),
    ('The Last Secret', 'Thriller', '2018-12-12', '9780001234120', 310, 'The final secret is revealed.', 20.49, '/images/the_last_secret.jpg', 40, 5),

    -- Computing
    ('Python for All', 'Computing', '2022-02-15', '9780001234201', 500, 'A comprehensive guide to Python programming for beginners.', 39.99, '/images/python_for_all.jpg', 41, 4),
    ('AI Revolution', 'Computing', '2020-11-01', '9780001234202', 420, 'An exploration of artificial intelligence and its impact on society.', 29.99, '/images/ai_revolution.jpg', 42, 5),
    ('Web Development 101', 'Computing', '2019-04-10', '9780001234203', 300, 'A beginner-friendly guide to building websites.', 25.99, '/images/web_dev_101.jpg', 43, 1),
    ('Data Structures Simplified', 'Computing', '2018-09-05', '9780001234204', 350, 'Understanding data structures in computer science.', 28.99, '/images/data_structures_simplified.jpg', 44, 2),
    ('Machine Learning Basics', 'Computing', '2021-03-22', '9780001234205', 400, 'An introduction to machine learning concepts and algorithms.', 34.99, '/images/machine_learning_basics.jpg', 45, 3),
    ('Cybersecurity Essentials', 'Computing', '2019-07-18', '9780001234206', 380, 'Protecting systems against cyber threats.', 32.49, '/images/cybersecurity_essentials.jpg', 46, 4),
    ('Advanced Java Programming', 'Computing', '2020-10-30', '9780001234207', 450, 'Deep dive into Java for experienced programmers.', 36.99, '/images/advanced_java_programming.jpg', 47, 5),
    ('Database Management Systems', 'Computing', '2018-05-25', '9780001234208', 420, 'Comprehensive coverage of database systems.', 31.99, '/images/database_management_systems.jpg', 48, 1),
    ('Cloud Computing Explained', 'Computing', '2021-09-14', '9780001234209', 310, 'Understanding the fundamentals of cloud computing.', 27.49, '/images/cloud_computing_explained.jpg', 49, 2),
    ('Introduction to Algorithms', 'Computing', '2019-11-20', '9780001234210', 550, 'A foundational text on algorithms and their applications.', 44.99, '/images/introduction_to_algorithms.jpg', 50, 3),
    ('Blockchain Basics', 'Computing', '2020-04-10', '9780001234211', 280, 'An introduction to blockchain technology and its uses.', 26.99, '/images/blockchain_basics.jpg', 51, 4),
    ('JavaScript in Depth', 'Computing', '2018-06-05', '9780001234212', 360, 'Mastering JavaScript for web development.', 29.99, '/images/javascript_in_depth.jpg', 52, 5),
    ('Artificial Intelligence Applications', 'Computing', '2021-12-01', '9780001234213', 400, 'Practical AI applications in various industries.', 35.99, '/images/artificial_intelligence_applications.jpg', 53, 1),
    ('Mobile App Development', 'Computing', '2019-08-15', '9780001234214', 320, 'Building mobile applications for Android and iOS.', 28.49, '/images/mobile_app_development.jpg', 54, 2),
    ('Introduction to Data Science', 'Computing', '2020-02-20', '9780001234215', 450, 'Basics of data science and its methodologies.', 33.99, '/images/introduction_to_data_science.jpg', 55, 3),

    -- Romance
    ('Love in Tuscany', 'Romance', '2021-06-01', '9780001234301', 320, 'A heartwarming romance set in the beautiful landscapes of Tuscany.', 14.99, '/images/love_in_tuscany.jpg', 56, 3),
    ('The Paris Affair', 'Romance', '2019-10-12', '9780001234302', 280, 'Two strangers find love in the streets of Paris.', 13.49, '/images/the_paris_affair.jpg', 57, 2),
    ('A Whispered Promise', 'Romance', '2018-09-15', '9780001234303', 360, 'A forbidden love set against the backdrop of war.', 16.49, '/images/a_whispered_promise.jpg', 58, 4),
    ('Heartstrings', 'Romance', '2021-11-05', '9780001234304', 360, 'An emotional love story that spans decades.', 12.99, '/images/heartstrings.jpg', 59, 2),
    ('The Love Algorithm', 'Romance', '2020-07-10', '9780001234305', 310, 'A mathematician finds love through an algorithm.', 15.49, '/images/the_love_algorithm.jpg', 60, 5),
    ('Summer in Provence', 'Romance', '2019-05-20', '9780001234306', 300, 'A summer romance blossoms in Provence.', 14.49, '/images/summer_in_provence.jpg', 61, 1),
    ('Eternal Embrace', 'Romance', '2020-12-25', '9780001234307', 340, 'An eternal love that defies time.', 17.99, '/images/eternal_embrace.jpg', 62, 4),
    ('Moonlit Nights', 'Romance', '2018-04-18', '9780001234308', 280, 'Romance under the moonlit sky.', 13.99, '/images/moonlit_nights.jpg', 63, 3),
    ('Whispers of Love', 'Romance', '2021-02-14', '9780001234309', 320, 'Soft whispers lead to deep love.', 16.99, '/images/whispers_of_love.jpg', 64, 2),
    ('Autumn Hearts', 'Romance', '2019-10-30', '9780001234310', 310, 'Love blossoms in the autumn season.', 15.99, '/images/autumn_hearts.jpg', 65, 5),
    ('Sunset Serenade', 'Romance', '2020-08-22', '9780001234311', 290, 'A serenade at sunset brings two hearts together.', 14.49, '/images/sunset_serenade.jpg', 66, 1),
    ('Secrets of the Heart', 'Romance', '2021-09-10', '9780001234312', 350, 'Unveiling the secrets that lie within the heart.', 18.49, '/images/secrets_of_the_heart.jpg', 67, 4),
    ('Love Unbound', 'Romance', '2018-03-05', '9780001234313', 300, 'Love that knows no boundaries.', 17.49, '/images/love_unbound.jpg', 68, 3),
    ('Cherished Moments', 'Romance', '2020-11-20', '9780001234314', 330, 'Cherishing the moments that define love.', 19.99, '/images/cherished_moments.jpg', 69, 2),
    ('Passionate Hearts', 'Romance', '2019-07-15', '9780001234315', 340, 'Hearts filled with passion and love.', 20.49, '/images/passionate_hearts.jpg', 70, 5),

    -- Fantasy
    ('Dragons of Eternity', 'Fantasy', '2018-09-01', '9780001234401', 450, 'An epic tale of dragons, magic, and heroism.', 24.99, '/images/dragons_of_eternity.jpg', 71, 1),
    ('The Shadow Mage', 'Fantasy', '2020-04-05', '9780001234402', 380, 'A young mage discovers their hidden powers.', 22.49, '/images/the_shadow_mage.jpg', 72, 4),
    ('Mystic Isles', 'Fantasy', '2020-08-25', '9780001234403', 420, 'A mystical adventure set on magical islands.', 25.99, '/images/mystic_isles.jpg', 73, 3),
    ('Elven Legends', 'Fantasy', '2019-05-10', '9780001234404', 400, 'Legends of the Elven warriors in a magical realm.', 23.99, '/images/elven_legends.jpg', 74, 2),
    ('The Faerie Realm', 'Fantasy', '2021-07-18', '9780001234405', 360, 'A journey into the hidden realm of faeries.', 21.49, '/images/the_faerie_realm.jpg', 75, 5),
    ('Wizard\'s Quest', 'Fantasy', '2018-11-22', '9780001234406', 390, 'A wizard\'s quest to find the lost spellbook.', 24.49, '/images/wizards_quest.jpg', 76, 1),
    ('Realm of Shadows', 'Fantasy', '2020-01-30', '9780001234407', 420, 'Battling shadows in a dark fantasy world.', 23.49, '/images/realm_of_shadows.jpg', 77, 4),
    ('The Enchanted Forest', 'Fantasy', '2019-09-12', '9780001234408', 310, 'Adventures in an enchanted forest filled with magic.', 19.99, '/images/the_enchanted_forest.jpg', 78, 3),
    ('Dragonfire', 'Fantasy', '2021-03-20', '9780001234409', 400, 'Dragons unleash their fire upon the kingdom.', 25.99, '/images/dragonfire.jpg', 79, 2),
    ('The Last Sorcerer', 'Fantasy', '2018-06-15', '9780001234410', 350, 'The last sorcerer must save the world from darkness.', 22.99, '/images/the_last_sorcerer.jpg', 80, 5),
    ('Cursed Kingdom', 'Fantasy', '2020-10-05', '9780001234411', 380, 'A kingdom cursed by dark magic.', 24.49, '/images/cursed_kingdom.jpg', 81, 1),
    ('Mermaid\'s Song', 'Fantasy', '2019-02-28', '9780001234412', 320, 'A mermaid\'s song captivates the hearts of sailors.', 20.99, '/images/mermaids_song.jpg', 82, 4),
    ('The Forgotten Realm', 'Fantasy', '2021-05-10', '9780001234413', 400, 'Exploring the forgotten realms beyond imagination.', 23.99, '/images/the_forgotten_realm.jpg', 83, 3),
    ('Sorcerer\'s Dawn', 'Fantasy', '2018-04-22', '9780001234414', 390, 'The dawn of a new sorcerer who changes the world.', 24.49, '/images/sorcerers_dawn.jpg', 84, 2),
    ('The Crystal Tower', 'Fantasy', '2020-12-01', '9780001234415', 410, 'Climbing the crystal tower to unlock ancient secrets.', 25.99, '/images/the_crystal_tower.jpg', 85, 5),
    ('Elven Kingdom', 'Fantasy', '2019-07-18', '9700001234416', 350, 'The rise and fall of an elven kingdom.', 22.99, '/images/elven_kingdom.jpg', 86, 1),
    ('The Magical Codex', 'Fantasy', '2021-09-25', '9780001234417', 400, 'A codex that holds the secrets of magic.', 23.99, '/images/the_magical_codex.jpg', 87, 4),
    ('Phoenix Rising', 'Fantasy', '2018-03-10', '9780001234418', 420, 'The rise of the phoenix and its impact on the world.', 24.99, '/images/phoenix_rising.jpg', 88, 3),
    ('The Shadow Blade', 'Fantasy', '2020-08-15', '9780001234419', 360, 'A blade forged in shadows that can change destiny.', 21.49, '/images/the_shadow_blade.jpg', 89, 2),
    ('Guardian of Light', 'Fantasy', '2019-11-30', '9780001234420', 380, 'A guardian protects the realm from darkness.', 24.49, '/images/guardian_of_light.jpg', 90, 5),

    -- Mathematics
    ('The Calculus Enigma', 'Mathematics', '2017-12-15', '9780001234501', 300, 'A deep dive into the mysteries of calculus.', 29.99, '/images/the_calculus_enigma.jpg', 91, 5),
    ('Numbers Never Lie', 'Mathematics', '2019-07-01', '9780001234502', 280, 'A fascinating journey into the world of mathematics.', 27.99, '/images/numbers_never_lie.jpg', 92, 3),
    ('Infinite Equations', 'Mathematics', '2019-03-15', '9780001234503', 310, 'Exploring the beauty of equations in mathematics.', 28.99, '/images/infinite_equations.jpg', 93, 4),
    ('Topology Simplified', 'Mathematics', '2020-05-20', '9780001234504', 350, 'Understanding the concepts of topology.', 30.99, '/images/topology_simplified.jpg', 94, 2),
    ('Algebra Advanced', 'Mathematics', '2018-10-10', '9780001234505', 320, 'Advanced topics in algebra for enthusiasts.', 29.49, '/images/algebra_advanced.jpg', 95, 1),
    ('Mathematical Puzzles', 'Mathematics', '2021-02-05', '9780001234506', 290, 'Challenging puzzles to sharpen your mathematical skills.', 26.99, '/images/mathematical_puzzles.jpg', 96, 5),
    ('Linear Algebra Explained', 'Mathematics', '2019-08-25', '9780001234507', 340, 'A comprehensive guide to linear algebra.', 31.99, '/images/linear_algebra_explained.jpg', 97, 3),
    ('Probability Theory', 'Mathematics', '2020-09-12', '9780001234508', 310, 'Understanding probability and its applications.', 28.49, '/images/probability_theory.jpg', 98, 4),
    ('Number Theory Basics', 'Mathematics', '2018-11-30', '9780001234509', 300, 'Basics of number theory for beginners.', 27.49, '/images/number_theory_basics.jpg', 99, 2),
    ('Discrete Mathematics', 'Mathematics', '2021-04-18', '9780001234510', 360, 'Exploring discrete structures and their properties.', 32.99, '/images/discrete_mathematics.jpg', 100, 5),
    ('Sorcerer\'s Dawn', 'Fantasy', '2018-04-22', '9780001534414', 340, 'A sorcerer discovers their powers at dawn.', 21.99, '/images/sorcerers_dawn.jpg', 84, 5),
    ('Crystal Guardians', 'Fantasy', '2020-12-01', '9780006234415', 390, 'Guardians protect the mystical crystal from evil.', 23.49, '/images/crystal_guardians.jpg', 85, 1),
    ('Phoenix Rising', 'Fantasy', '2021-09-15', '9780001234416', 410, 'A phoenix rises to bring hope to a doomed world.', 25.49, '/images/phoenix_rising.jpg', 86, 2),
    ('The Lunar Chronicles', 'Fantasy', '2019-07-25', '9755001234417', 360, 'Adventures inspired by the magic of the moon.', 22.99, '/images/lunar_chronicles.jpg', 87, 3),
    ('Gates of Eternity', 'Fantasy', '2022-03-10', '9785101234418', 400, 'A journey to the gates that hold eternal secrets.', 24.99, '/images/gates_of_eternity.jpg', 88, 4);
COMMIT;
   

INSERT INTO books (id, title, genre, publication_date, isbn, page_count, summary, price, image_url, author_id, publisher_id) VALUES
(106, 'Dune', 'Sci-Fi', '1965-06-01', '9780441013593', 412, 'A desert planet, a prophecy, and a battle for survival.', 14.99, '/images/dune.jpg', 245, 6),
(107, 'The Three-Body Problem', 'Sci-Fi', '2008-05-01', '9780765382030', 400, 'A first-contact story with far-reaching consequences.', 15.99, '/images/three_body_problem.jpg', 246, 7),
(108, 'Foundation', 'Sci-Fi', '1951-06-01', '9780553293357', 296, 'The collapse of a galactic empire and the science of prediction.', 12.99, '/images/foundation.jpg', 247, 1),
(109, 'Neuromancer', 'Sci-Fi', '1984-07-01', '9780441569595', 271, 'A hacker is hired for a dangerous cyberspace mission.', 13.99, '/images/neuromancer.jpg', 248, 2),
(110, 'Snow Crash', 'Sci-Fi', '1992-06-01', '9780553380958', 480, 'A high-tech cyberpunk world where information is power.', 16.99, '/images/snow_crash.jpg', 249, 3),
(111, '2001: A Space Odyssey', 'Sci-Fi', '1968-07-01', '9780345347977', 275, 'A mysterious monolith appears, and humans are guided by an alien intelligence.', 17.99, '/images/space_odyssey.jpg', 250, 6),
(112, 'The Handmaid\'s Tale', 'Dystopian', '1985-04-01', '9780385490818', 311, 'A dystopian society where women have been stripped of their rights.', 14.99, '/images/handmaids_tale.jpg', 251, 7),
(113, 'Do Androids Dream of Electric Sheep?', 'Sci-Fi', '1968-06-01', '9780345404472', 210, 'A bounty hunter hunts down rogue androids in a post-apocalyptic world.', 15.99, '/images/androis_dream.jpg', 252, 1),
(114, 'Star Wars: Lost Stars', 'Sci-Fi', '2015-09-04', '9781101966943', 560, 'A story of love and loyalty set during the Galactic Civil War.', 16.99, '/images/lost_stars.jpg', 253, 2),
(115, 'The Left Hand of Darkness', 'Sci-Fi', '1969-01-01', '9780441007318', 300, 'A mission to a planet where inhabitants can change gender and form. ', 17.99, '/images/left_hand_darkness.jpg', 254, 3),
(116, 'Starship Troopers', 'Sci-Fi', '1959-12-01', '9780441783588', 286, 'A soldier reflects on his experiences fighting against alien bugs in a futuristic war.', 13.99, '/images/starship_troopers.jpg', 255, 6),
(117, 'Ender\'s Game', 'Sci-Fi', '1985-01-01', '9780812550702', 324, 'A young boy is trained to fight an alien species threatening humanity.', 12.99, '/images/enders_game.jpg', 256, 7),
(118, 'The Forever War', 'Sci-Fi', '1974-12-01', '9780446603845', 292, 'A soldier in a war that spans centuries due to time dilation.', 14.99, '/images/forever_war.jpg', 257, 1),
(119, 'Red Mars', 'Sci-Fi', '1990-11-01', '9780553560732', 560, 'The first colonists on Mars must overcome challenges to make the planet habitable.', 17.99, '/images/red_mars.jpg', 258, 2),
(120, 'Fahrenheit 451', 'Dystopian', '1953-10-01', '9781451673319', 258, 'In a future where books are banned, one man defies the system.', 15.99, '/images/fahrenheit_451.jpg', 259, 3),
(121, 'The Hobbit', 'Fantasy', '1937-09-21', '9780345339683', 310, 'A young hobbit goes on an adventure to help reclaim a lost treasure.', 18.99, '/images/hobbit.jpg', 260, 6),
(122, 'A Game of Thrones', 'Fantasy', '1996-08-06', '9780553103540', 694, 'A political and epic fantasy set in the mythical land of Westeros.', 19.99, '/images/game_of_thrones.jpg', 261, 7),
(123, 'The Hitchhiker\'s Guide to the Galaxy', 'Sci-Fi', '1979-10-12', '9780345391803', 224, 'A comedic adventure through space involving an unlikely hero.', 12.99, '/images/hitchhikers_guide.jpg', 262, 1),
(124, 'American Gods', 'Fantasy', '2001-06-19', '9780380789043', 465, 'A man is caught in a conflict between old and new gods in modern-day America.', 17.99, '/images/american_gods.jpg', 263, 2),
(125, 'Reaper Man', 'Sci-Fi', '1991-06-01', '9780061009031', 366, 'Death is suddenly missing from the world, causing chaos.', 14.99, '/images/reaper_man.jpg', 264, 3),
(126, 'Hyperion', 'Sci-Fi', '1989-05-01', '9780553381344', 482, 'A journey to a mysterious world where seven pilgrims tell their stories.', 16.99, '/images/hyperion.jpg', 245, 6),
(127, 'The Wind-Up Girl', 'Sci-Fi', '2009-10-06', '9781597801583', 400, 'In a post-climate-change world, a genetically modified woman is used as a pawn in corporate games.', 14.99, '/images/wind_up_girl.jpg', 246, 7),
(128, 'Blindsight', 'Sci-Fi', '2006-11-01', '9780765312142', 391, 'A ship on an alien world faces an unsettling encounter with extraterrestrial intelligence.', 15.99, '/images/blindsight.jpg', 247, 1),
(129,'The Player of Games', 'Sci-Fi', '1988-05-01', '9780553296341', 300, 'A game player is thrust into a conflict between two alien civilizations.', 13.99, '/images/player_of_games.jpg', 248, 2),
(130, 'The Yiddish Policemen\'s Union', 'Sci-Fi', '2007-06-05', '9780399154748', 412, 'A noir detective novel set in an alternate history where the state of Israel never existed.', 16.99, '/images/yiddish_policemens_union.jpg', 249, 3),
(131, 'The Martian', 'Sci-Fi', '2011-02-11', '9780553418026', 369, 'An astronaut stranded on Mars uses his ingenuity to survive.', 18.99, '/images/martian.jpg', 250, 6),
(132, 'The Night Circus', 'Fantasy', '2011-09-13', '9780385534642', 387, 'A magical competition between two young illusionists draws them into an intricate battle.', 17.99, '/images/night_circus.jpg', 251, 7),
(133, 'The Dark Tower: The Gunslinger', 'Fantasy', '1982-06-10', '9780450012538', 301, 'A dark fantasy epic about a lone gunslinger on a quest across a vast, desolate world.', 14.99, '/images/dark_tower_gunslinger.jpg', 252, 1),
(134, 'The Name of the Wind', 'Fantasy', '2007-03-27', '9780756404741', 662, 'A young man recounts the tale of his rise from an orphan to a legendary figure.', 19.99, '/images/name_of_the_wind.jpg', 253, 2),
(135, 'The Black Prism', 'Fantasy', '2010-08-10', '9780765326194', 528, 'A world where magic is based on the manipulation of light and color.', 18.99, '/images/black_prism.jpg', 254, 3),
(136, 'The Lies of Locke Lamora', 'Fantasy', '2006-06-27', '9780553588941', 541, 'A group of skilled thieves navigate the criminal underworld of a city filled with danger.', 17.99, '/images/locke_lamora.jpg', 255, 6),
(137, 'The Bone Clocks', 'Fantasy', '2014-09-02', '9780385352554', 624, 'A woman’s life intersects with that of others across time and space, revealing a supernatural connection.', 19.99, '/images/bone_clocks.jpg', 256, 7),
(138, 'The Ocean at the End of the Lane', 'Fantasy', '2013-06-18', '9780062255655', 192, 'A man recalls his childhood encounter with an ancient supernatural force.', 14.99, '/images/ocean_end_lane.jpg', 257, 1),
(139, 'Good Omens', 'Fantasy', '1990-05-23', '9780060853976', 400, 'A demon and an angel team up to prevent the end of the world.', 16.99, '/images/good_omens.jpg', 258, 2),
(140,'The Priory of the Orange Tree', 'Fantasy', '2019-02-26', '9781635570318', 848, 'A tale of dragons, magic, and political intrigue set in a world of matriarchy.', 21.99, '/images/priory_orange_tree.jpg', 259, 3);

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




DELIMITER //
CREATE PROCEDURE remove_item_from_cart_logged_in(IN p_userId INT, IN p_bookId INT)
BEGIN
    DELETE FROM cart WHERE user_id = p_userId AND book_id = p_bookId;
END //
DELIMITER ;


DELIMITER //
CREATE PROCEDURE remove_item_from_cart_session(IN p_sessionId VARCHAR(255), IN p_bookId INT)
BEGIN
    DELETE FROM cart WHERE user_session_id = p_sessionId AND book_id = p_bookId;
END //
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






DELIMITER //

CREATE PROCEDURE FetchWishlist(
    IN p_user_id INT,
    IN p_user_session_id VARCHAR(255)
)
BEGIN
    SELECT 
        wish_lists.book_id, 
        wish_lists.quantity, 
        books.title AS book_title, 
        CAST(books.price AS DECIMAL(10,2)) AS price, 
        books.image_url
    FROM wish_lists
    JOIN books ON wish_lists.book_id = books.id
    WHERE (p_user_id IS NOT NULL AND wish_lists.user_id = p_user_id)
       OR (p_user_id IS NULL AND wish_lists.user_session_id = p_user_session_id);
END //

DELIMITER ;



DELIMITER //

CREATE PROCEDURE UpdateWishlistQuantity(
    IN p_user_id INT,
    IN p_user_session_id VARCHAR(255),
    IN p_book_id INT,
    IN p_quantity INT
)
BEGIN
    IF p_user_id IS NOT NULL THEN
        -- Update for logged-in users
        UPDATE wish_lists
        SET quantity = p_quantity
        WHERE user_id = p_user_id AND book_id = p_book_id;
    ELSE
        -- Update for session-based users
        UPDATE wish_lists
        SET quantity = p_quantity
        WHERE user_session_id = p_user_session_id AND book_id = p_book_id;
    END IF;
END //

DELIMITER ;




-- Stored procedure for logged-in users
DELIMITER //
CREATE PROCEDURE RemoveFromWishlistLoggedIn(
    IN p_user_id INT,
    IN p_book_id INT
)
BEGIN
    DELETE FROM wish_lists
    WHERE user_id = p_user_id AND book_id = p_book_id;
END //
DELIMITER ;

-- Stored procedure for guest users (session-based)
DELIMITER //
CREATE PROCEDURE RemoveFromWishlistSession(
    IN p_session_id VARCHAR(255),
    IN p_book_id INT
)
BEGIN
    DELETE FROM wish_lists
    WHERE user_session_id = p_session_id AND book_id = p_book_id;
END //
DELIMITER ;



DELIMITER //
CREATE PROCEDURE FetchCartForCheckout(
    IN p_user_id INT
)
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
END //
DELIMITER ;



DELIMITER $$

CREATE PROCEDURE FetchCategories()
BEGIN
    SELECT DISTINCT category_name AS name FROM categories;
END $$

DELIMITER ;


 
 DELIMITER //

CREATE PROCEDURE GetAllUsers()
BEGIN
    SELECT * FROM users;
END //

DELIMITER ;




DELIMITER //

CREATE PROCEDURE GetAllAuthors()
BEGIN
    SELECT * FROM authors;
END //

DELIMITER ;




DELIMITER //

CREATE PROCEDURE GetBooks(IN p_limit INT, IN p_offset INT)
BEGIN
    SELECT * FROM books LIMIT p_limit OFFSET p_offset;
END //

DELIMITER ;



DELIMITER //

CREATE PROCEDURE GetBookById(IN p_bookId INT)
BEGIN
    SELECT * FROM books WHERE id = p_bookId;
END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE GetUserById(IN p_userId INT)
BEGIN
    SELECT * FROM users WHERE id = p_userId;
END //

DELIMITER ;


DELIMITER //

CREATE PROCEDURE GetOrders(IN p_limit INT, IN p_offset INT)
BEGIN
    SELECT * FROM orders LIMIT p_limit OFFSET p_offset;
END //

DELIMITER ;




DELIMITER //

CREATE PROCEDURE PlaceOrder(
    IN p_userId INT, 
    IN p_bookId INT, 
    IN p_quantity INT,
    OUT p_orderId INT
)
BEGIN
    INSERT INTO orders (user_id, book_id, quantity) 
    VALUES (p_userId, p_bookId, p_quantity);
    
    SET p_orderId = LAST_INSERT_ID();
END //

DELIMITER ;



DELIMITER $$

CREATE PROCEDURE GetPaginatedAuthors(IN p_limit INT, IN p_offset INT)
BEGIN
    SELECT * FROM authors  -- Replace 'authors' with your actual table name
    LIMIT p_limit OFFSET p_offset;
END$$

DELIMITER ;


DELIMITER $$

CREATE PROCEDURE GetPaginatedUsers(
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    SELECT * FROM users LIMIT p_limit OFFSET p_offset;
END $$

DELIMITER ;




DELIMITER //

CREATE PROCEDURE GetAuthorById(IN authorId INT)
BEGIN
    SELECT * FROM Authors WHERE id = authorId;
END //

DELIMITER ;




DELIMITER //

CREATE PROCEDURE GetPublisherById(IN publisherid INT)
BEGIN
    SELECT * FROM Publisher WHERE id = publisherid;
END //


CREATE PROCEDURE GetPaginatedPublishers(IN lim INT, IN off INT)
BEGIN
    SELECT * FROM Publisher LIMIT lim OFFSET off;
END //

DELIMITER ;
