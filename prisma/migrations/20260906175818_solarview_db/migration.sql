-- CreateTable
CREATE TABLE "system_config" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "battery_capacity" INTEGER NOT NULL,
    "panel_size" REAL NOT NULL,
    "min_soc" REAL NOT NULL,
    "installation_year" INTEGER NOT NULL DEFAULT 2025,
    "panel_rating" INTEGER NOT NULL DEFAULT 400,
    "number_of_panels" INTEGER NOT NULL DEFAULT 10,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "appliances" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "room_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "wattage" INTEGER NOT NULL,
    "usage_hours" REAL NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "appliances_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "system_config_user_id_key" ON "system_config"("user_id");

-- CreateIndex
CREATE INDEX "rooms_user_id_idx" ON "rooms"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "rooms_user_id_name_key" ON "rooms"("user_id", "name");

-- CreateIndex
CREATE INDEX "appliances_room_id_idx" ON "appliances"("room_id");
