-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jul 24, 2026 at 03:19 PM
-- Server version: 8.4.7
-- PHP Version: 8.3.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `echofy`
--

-- --------------------------------------------------------

--
-- Table structure for table `albums`
--

DROP TABLE IF EXISTS `albums`;
CREATE TABLE IF NOT EXISTS `albums` (
  `album_id` int NOT NULL AUTO_INCREMENT,
  `artist_id` int NOT NULL,
  `title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cover_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `release_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`album_id`),
  KEY `idx_album_artist` (`artist_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `albums`
--

INSERT INTO `albums` (`album_id`, `artist_id`, `title`, `cover_image`, `release_date`, `created_at`) VALUES
(1, 2, 'Neon Horizons', 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=600&q=80', '2025-11-15', '2026-07-22 17:00:36'),
(2, 3, 'Retro Voltage', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80', '2026-02-01', '2026-07-22 17:00:36'),
(3, 4, 'Midnight Coffee & Rain', 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80', '2026-04-10', '2026-07-22 17:00:36');

-- --------------------------------------------------------

--
-- Table structure for table `artists`
--

DROP TABLE IF EXISTS `artists`;
CREATE TABLE IF NOT EXISTS `artists` (
  `artist_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `biography` text COLLATE utf8mb4_unicode_ci,
  `banner_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_plays` bigint NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`artist_id`),
  UNIQUE KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `artists`
--

INSERT INTO `artists` (`artist_id`, `user_id`, `biography`, `banner_image`, `total_plays`, `created_at`) VALUES
(1, 1, 'Demo artist account for testing uploads.', NULL, 0, '2026-07-21 06:24:00'),
(2, 3, 'Indie Pop & Electronic Music Producer from London. Crafting ethereal synth melodies and modern beats.', NULL, 39544, '2026-07-22 17:00:36'),
(3, 4, 'Alternative Rock & Synth-wave Band. High energy rhythms with retro futuristic vibes.', NULL, 19334, '2026-07-22 17:00:36'),
(4, 5, 'Lo-Fi Chill Hop and Ambient Soundscape Composer.', NULL, 38378, '2026-07-22 17:00:36'),
(5, 7, 'Artist profile for artist', NULL, 14, '2026-07-22 17:08:59');

-- --------------------------------------------------------

--
-- Table structure for table `favorites`
--

DROP TABLE IF EXISTS `favorites`;
CREATE TABLE IF NOT EXISTS `favorites` (
  `favorite_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `song_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`favorite_id`),
  UNIQUE KEY `uq_user_song_favorite` (`user_id`,`song_id`),
  KEY `fk_fav_song` (`song_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `genres`
--

DROP TABLE IF EXISTS `genres`;
CREATE TABLE IF NOT EXISTS `genres` (
  `genre_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`genre_id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `genres`
--

INSERT INTO `genres` (`genre_id`, `name`) VALUES
(7, 'Classical'),
(10, 'Devotional'),
(5, 'Electronic'),
(2, 'Hip-Hop'),
(8, 'Indie'),
(6, 'Jazz'),
(9, 'Lo-fi'),
(1, 'Pop'),
(4, 'R&B'),
(3, 'Rock');

-- --------------------------------------------------------

--
-- Table structure for table `playlists`
--

DROP TABLE IF EXISTS `playlists`;
CREATE TABLE IF NOT EXISTS `playlists` (
  `playlist_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`playlist_id`),
  KEY `idx_playlist_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `playlist_songs`
--

DROP TABLE IF EXISTS `playlist_songs`;
CREATE TABLE IF NOT EXISTS `playlist_songs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `playlist_id` int NOT NULL,
  `song_id` int NOT NULL,
  `added_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_playlist_song` (`playlist_id`,`song_id`),
  KEY `fk_ps_song` (`song_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `recently_played`
--

DROP TABLE IF EXISTS `recently_played`;
CREATE TABLE IF NOT EXISTS `recently_played` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `song_id` int NOT NULL,
  `played_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_rp_song` (`song_id`),
  KEY `idx_rp_user_time` (`user_id`,`played_at`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `recently_played`
--

INSERT INTO `recently_played` (`id`, `user_id`, `song_id`, `played_at`) VALUES
(1, 6, 5, '2026-07-22 17:07:35'),
(2, 7, 2, '2026-07-22 17:09:48'),
(3, 7, 9, '2026-07-23 04:36:16'),
(4, 7, 10, '2026-07-23 04:39:49'),
(5, 7, 7, '2026-07-23 04:44:31'),
(6, 7, 2, '2026-07-23 04:45:07'),
(7, 7, 10, '2026-07-23 04:46:57'),
(8, 7, 9, '2026-07-23 04:47:14'),
(9, 7, 7, '2026-07-23 04:47:17'),
(10, 7, 9, '2026-07-23 04:47:23'),
(11, 7, 10, '2026-07-23 04:47:26'),
(12, 7, 18, '2026-07-23 05:06:26'),
(13, 7, 14, '2026-07-23 05:06:45'),
(14, 6, 18, '2026-07-23 05:09:36'),
(15, 6, 13, '2026-07-23 05:11:37'),
(16, 6, 7, '2026-07-23 05:11:56'),
(17, 6, 13, '2026-07-23 05:12:05'),
(18, 6, 14, '2026-07-23 05:15:51'),
(19, 6, 13, '2026-07-23 05:17:24'),
(20, 6, 14, '2026-07-23 05:17:34');

-- --------------------------------------------------------

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
CREATE TABLE IF NOT EXISTS `refresh_tokens` (
  `token_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`token_id`),
  KEY `fk_token_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `songs`
--

DROP TABLE IF EXISTS `songs`;
CREATE TABLE IF NOT EXISTS `songs` (
  `song_id` int NOT NULL AUTO_INCREMENT,
  `artist_id` int NOT NULL,
  `album_id` int DEFAULT NULL,
  `genre_id` int DEFAULT NULL,
  `title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cover_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration` int DEFAULT NULL,
  `play_count` bigint NOT NULL DEFAULT '0',
  `like_count` bigint NOT NULL DEFAULT '0',
  `is_trending` tinyint(1) NOT NULL DEFAULT '0',
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`song_id`),
  KEY `idx_song_artist` (`artist_id`),
  KEY `idx_song_album` (`album_id`),
  KEY `idx_song_genre` (`genre_id`),
  KEY `idx_song_title` (`title`),
  KEY `idx_song_trending` (`is_trending`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `songs`
--

INSERT INTO `songs` (`song_id`, `artist_id`, `album_id`, `genre_id`, `title`, `file_path`, `cover_image`, `duration`, `play_count`, `like_count`, `is_trending`, `uploaded_at`) VALUES
(1, 2, 1, 5, 'Electric Dreams', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80', 372, 14200, 840, 1, '2026-07-22 17:00:36'),
(2, 2, 1, 1, 'Starlight Symphony', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80', 422, 9802, 520, 1, '2026-07-22 17:00:36'),
(3, 3, 2, 3, 'Thunder pulse', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80', 344, 18900, 1250, 1, '2026-07-22 17:00:36'),
(4, 3, 2, 3, 'Neon Highway', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80', 302, 7400, 410, 0, '2026-07-22 17:00:36'),
(5, 4, 3, 9, '3 AM Chill Hop', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=600&q=80', 512, 22101, 1890, 1, '2026-07-22 17:00:36'),
(6, 4, 3, 8, 'Soft Rain Reflections', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80', 410, 6100, 380, 0, '2026-07-22 17:00:36'),
(7, 2, 1, 1, 'Cyberpunk Symphony (YouTube Track)', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg', 212, 28903, 3100, 1, '2026-07-22 17:21:30'),
(8, 4, 3, 9, '3 AM Chill Hop (YouTube Stream)', 'https://www.youtube.com/watch?v=jfKfPfyJRdk', 'https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg', 512, 22100, 1890, 1, '2026-07-22 17:21:30'),
(9, 5, NULL, 7, 'Kalyani', 'https://youtu.be/xvT1jH8B9AM?si=SoPJhgbav_gonmlw', '/backend/uploads/covers/cover_1784781363_6a619a330528f.jpg', 210, 3, 0, 0, '2026-07-23 04:36:03'),
(10, 5, NULL, 7, 'Amsham', 'https://youtu.be/r8iPHiciQd0?si=5j-xDb-YLEUZl5Sh', '/backend/uploads/covers/cover_1784781555_6a619af353d86.jpg', 210, 3, 0, 0, '2026-07-23 04:39:15'),
(11, 5, NULL, 7, 'Ariyathe Ariyathe', 'https://youtu.be/835q0XXgqRY?si=2iExU6BkbF-1RtI7', 'https://img.youtube.com/vi/835q0XXgqRY/hqdefault.jpg', 210, 0, 0, 0, '2026-07-23 04:53:06'),
(12, 5, NULL, 7, 'Sakhiyeee', 'https://youtu.be/K9tAccj6c10?si=5CM2LrPNdNMKGSHR', 'https://img.youtube.com/vi/K9tAccj6c10/hqdefault.jpg', 210, 0, 0, 0, '2026-07-23 04:54:43'),
(13, 5, NULL, 7, 'Aaro Nee Aaro | Urumi', 'https://youtu.be/9os0o55MyR0?si=dv631BwaMPDST-Gg', 'https://img.youtube.com/vi/9os0o55MyR0/hqdefault.jpg', 210, 3, 0, 0, '2026-07-23 04:56:20'),
(14, 5, NULL, 7, 'Valmuna Kannile', 'https://youtu.be/wTdIaRZFizU?si=vS5o9pcRMVh9XnzW', 'https://img.youtube.com/vi/wTdIaRZFizU/hqdefault.jpg', 210, 3, 0, 0, '2026-07-23 04:57:37'),
(15, 5, NULL, 7, 'Othaiyadi Pathayila | Kanaa', 'https://youtu.be/4JrOPlxXl8Q?si=KEwqR6ZoDpQ_8Lg0', 'https://img.youtube.com/vi/4JrOPlxXl8Q/hqdefault.jpg', 210, 0, 0, 0, '2026-07-23 05:01:01'),
(16, 5, NULL, 7, 'Pavazha Malli', 'https://youtu.be/b68HETiNO98?si=par60GFVjuoXehuk', 'https://img.youtube.com/vi/b68HETiNO98/hqdefault.jpg', 210, 0, 0, 0, '2026-07-23 05:01:59'),
(17, 5, NULL, 7, 'Kanana Kuyile | Mr. Brahmachari', 'https://youtu.be/gm_zW91SAOc?si=U4KDRDMOJa5WPMuC', 'https://img.youtube.com/vi/gm_zW91SAOc/hqdefault.jpg', 210, 0, 0, 0, '2026-07-23 05:04:19'),
(18, 5, NULL, 7, 'Aavani Ponnoonjaal | Kottaram Veettile Appoottan', 'https://youtu.be/TKHenjnkPnw?si=ZH9I6lFss5Xe0BoB', 'https://img.youtube.com/vi/TKHenjnkPnw/hqdefault.jpg', 210, 2, 0, 0, '2026-07-23 05:05:42');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `profile_picture` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('listener','artist','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'listener',
  `theme` enum('light','dark') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'dark',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `name`, `email`, `password_hash`, `profile_picture`, `role`, `theme`, `is_active`, `created_at`, `updated_at`) VALUES
(6, 'joyboy', 'listner@gmail.com', '$2y$10$saiLIYFRhD3.20.1hsb5He87AJI6N8RTQQKA/W9doYnM3cNm8ugGK', NULL, 'listener', 'dark', 1, '2026-07-22 17:05:21', '2026-07-22 17:05:21'),
(7, 'artist', 'artist@gmail.com', '$2y$10$G1xpQvR8ExLFH.w5qoODTek3myk6vbG7af50yq78zmZ.kuEqRy8Tq', NULL, 'artist', 'dark', 1, '2026-07-22 17:08:59', '2026-07-22 17:08:59');

-- --------------------------------------------------------

--
-- Stand-in structure for view `view_latest_songs`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `view_latest_songs`;
CREATE TABLE IF NOT EXISTS `view_latest_songs` (
`song_id` int
,`title` varchar(150)
,`uploaded_at` timestamp
,`artist_name` varchar(100)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `view_popular_artists`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `view_popular_artists`;
CREATE TABLE IF NOT EXISTS `view_popular_artists` (
`artist_id` int
,`artist_name` varchar(100)
,`profile_picture` varchar(255)
,`total_plays` bigint
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `view_trending_songs`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `view_trending_songs`;
CREATE TABLE IF NOT EXISTS `view_trending_songs` (
`song_id` int
,`title` varchar(150)
,`play_count` bigint
,`like_count` bigint
,`uploaded_at` timestamp
,`artist_id` int
,`artist_name` varchar(100)
);

-- --------------------------------------------------------

--
-- Structure for view `view_latest_songs`
--
DROP TABLE IF EXISTS `view_latest_songs`;

DROP VIEW IF EXISTS `view_latest_songs`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `view_latest_songs`  AS SELECT `s`.`song_id` AS `song_id`, `s`.`title` AS `title`, `s`.`uploaded_at` AS `uploaded_at`, `u`.`name` AS `artist_name` FROM ((`songs` `s` join `artists` `a` on((`s`.`artist_id` = `a`.`artist_id`))) join `users` `u` on((`a`.`user_id` = `u`.`user_id`))) ORDER BY `s`.`uploaded_at` DESC ;

-- --------------------------------------------------------

--
-- Structure for view `view_popular_artists`
--
DROP TABLE IF EXISTS `view_popular_artists`;

DROP VIEW IF EXISTS `view_popular_artists`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `view_popular_artists`  AS SELECT `a`.`artist_id` AS `artist_id`, `u`.`name` AS `artist_name`, `u`.`profile_picture` AS `profile_picture`, `a`.`total_plays` AS `total_plays` FROM (`artists` `a` join `users` `u` on((`a`.`user_id` = `u`.`user_id`))) ORDER BY `a`.`total_plays` DESC ;

-- --------------------------------------------------------

--
-- Structure for view `view_trending_songs`
--
DROP TABLE IF EXISTS `view_trending_songs`;

DROP VIEW IF EXISTS `view_trending_songs`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `view_trending_songs`  AS SELECT `s`.`song_id` AS `song_id`, `s`.`title` AS `title`, `s`.`play_count` AS `play_count`, `s`.`like_count` AS `like_count`, `s`.`uploaded_at` AS `uploaded_at`, `a`.`artist_id` AS `artist_id`, `u`.`name` AS `artist_name` FROM ((`songs` `s` join `artists` `a` on((`s`.`artist_id` = `a`.`artist_id`))) join `users` `u` on((`a`.`user_id` = `u`.`user_id`))) WHERE (`s`.`is_trending` = 1) ORDER BY `s`.`play_count` DESC, `s`.`uploaded_at` DESC ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `albums`
--
ALTER TABLE `albums`
  ADD CONSTRAINT `fk_album_artist` FOREIGN KEY (`artist_id`) REFERENCES `artists` (`artist_id`) ON DELETE CASCADE;

--
-- Constraints for table `artists`
--
ALTER TABLE `artists`
  ADD CONSTRAINT `fk_artist_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `favorites`
--
ALTER TABLE `favorites`
  ADD CONSTRAINT `fk_fav_song` FOREIGN KEY (`song_id`) REFERENCES `songs` (`song_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_fav_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `playlists`
--
ALTER TABLE `playlists`
  ADD CONSTRAINT `fk_playlist_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `playlist_songs`
--
ALTER TABLE `playlist_songs`
  ADD CONSTRAINT `fk_ps_playlist` FOREIGN KEY (`playlist_id`) REFERENCES `playlists` (`playlist_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ps_song` FOREIGN KEY (`song_id`) REFERENCES `songs` (`song_id`) ON DELETE CASCADE;

--
-- Constraints for table `recently_played`
--
ALTER TABLE `recently_played`
  ADD CONSTRAINT `fk_rp_song` FOREIGN KEY (`song_id`) REFERENCES `songs` (`song_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_rp_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD CONSTRAINT `fk_token_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `songs`
--
ALTER TABLE `songs`
  ADD CONSTRAINT `fk_song_album` FOREIGN KEY (`album_id`) REFERENCES `albums` (`album_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_song_artist` FOREIGN KEY (`artist_id`) REFERENCES `artists` (`artist_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_song_genre` FOREIGN KEY (`genre_id`) REFERENCES `genres` (`genre_id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
