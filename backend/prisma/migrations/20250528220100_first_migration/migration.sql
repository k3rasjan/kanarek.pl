-- CreateTable
CREATE TABLE `Inspector` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vehicleId` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Trip` (
    `routeId` INTEGER NOT NULL,
    `service_id` INTEGER NOT NULL,
    `trip_id` VARCHAR(191) NOT NULL,
    `trip_headsign` VARCHAR(191) NOT NULL,
    `direction_id` INTEGER NOT NULL,
    `shape_id` INTEGER NOT NULL,
    `wheelchair_accessible` INTEGER NOT NULL,
    `brigade` INTEGER NOT NULL,

    PRIMARY KEY (`trip_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Shape` (
    `shape_id` INTEGER NOT NULL,
    `shape_pt_lat` DOUBLE NOT NULL,
    `shape_pt_lon` DOUBLE NOT NULL,
    `shape_pt_sequence` INTEGER NOT NULL,

    PRIMARY KEY (`shape_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
