-- CreateTable
CREATE TABLE "Genre" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Album" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "year" INTEGER,
    "date" TEXT,
    "tracks" INTEGER,
    "artistId" INTEGER,
    CONSTRAINT "Album_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Artist" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Music" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER,
    "artistId" INTEGER,
    "albumId" INTEGER,
    "track" INTEGER,
    "disk" INTEGER,
    "cover" TEXT,
    "file" TEXT NOT NULL,
    "date" TEXT,
    CONSTRAINT "Music_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Music_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MusicGenre" (
    "musicId" INTEGER NOT NULL,
    "genreId" INTEGER NOT NULL,

    PRIMARY KEY ("musicId", "genreId"),
    CONSTRAINT "MusicGenre_musicId_fkey" FOREIGN KEY ("musicId") REFERENCES "Music" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MusicGenre_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Playlist" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "PlaylistMusic" (
    "playlistId" INTEGER NOT NULL,
    "musicId" INTEGER NOT NULL,

    PRIMARY KEY ("playlistId", "musicId"),
    CONSTRAINT "PlaylistMusic_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlaylistMusic_musicId_fkey" FOREIGN KEY ("musicId") REFERENCES "Music" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Genre_name_key" ON "Genre"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Album_name_key" ON "Album"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_name_key" ON "Artist"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Music_hash_key" ON "Music"("hash");
