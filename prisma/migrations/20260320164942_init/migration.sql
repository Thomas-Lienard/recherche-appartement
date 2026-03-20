-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT,
    "source" TEXT,
    "title" TEXT,
    "price" REAL,
    "surface" REAL,
    "rooms" INTEGER,
    "address" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "description" TEXT,
    "photos" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'Nouveau',
    "notes" TEXT,
    "contactEmail" TEXT,
    "visitDate" DATETIME,
    "calendarEventId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
