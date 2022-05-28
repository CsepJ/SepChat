CREATE TABLE `user`(`id` TEXT NOT NULL, `name` TEXT NOT NULL, `email` TEXT, `description` TEXT NOT NULL, `password` TEXT NOT NULL, `friends` JSON NOT NULL, `mails` JSON NOT NULL, `banlist` JSON NOT NULL, `friendRequestList` JSON NOT NULL, `point` BIGINT, `profile` TEXT NOT NULL, `rooms` JSON NOT NULL, `banRoomList` JSON NOT NULL, `requestEmail` TEXT, `code` TEXT);
CREATE TABLE `room`(`id` TEXT NOT NULL, `name` TEXT NOT NULL, `password` TEXT, `members` JSON NOT NULL, `onlyFriend` JSON NOT NULL);