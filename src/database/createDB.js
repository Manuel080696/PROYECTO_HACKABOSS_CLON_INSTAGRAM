"use strict";
const getDB = require("./db");
require("dotenv").config();

let connect;

async function initDB() {
  try {
    connect = await getDB();
    console.log("Creo el Data Base");
    await connect.query(
      `
      CREATE DATABASE IF NOT EXISTS instaClon;
    `
    );
    await connect.query(
      `
        USE instaClon;
      `
    );
    console.log("Borramos las tablas");
    await connect.query(
      `
          DROP TABLE IF EXISTS likes
        `
    );
    await connect.query(
      `
            DROP TABLE IF EXISTS photos
          `
    );
    await connect.query(
      `
            DROP TABLE IF EXISTS users
          `
    );
    console.log("Creamos las tablas");
    await connect.query(
      `
        CREATE TABLE users(
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY ,
            avatar VARCHAR(250),
            name VARCHAR(50) NOT NULL,
            lastName VARCHAR (50) NOT NULL,
            email VARCHAR (250) UNIQUE NOT NULL,
            userName VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(100) NOT NULL,
            birthDay VARCHAR(10),
            active BOOLEAN DEFAULT 0,
            registrationCode VARCHAR(250)
        );
        `
    );
    await connect.query(
      `
        CREATE TABLE photos(
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            photoName VARCHAR(150),
            place VARCHAR(100),
            description VARCHAR(500),
            date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(),
            id_user INT UNSIGNED NOT NULL,
            FOREIGN KEY(id_user) REFERENCES users(id)
        );
          `
    );
    await connect.query(
      `
        CREATE TABLE likes(
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(),
            id_user INT UNSIGNED NOT NULL,
            id_photo INT UNSIGNED NOT NULL,
            FOREIGN KEY(id_user) REFERENCES users(id),
            FOREIGN KEY(id_photo) REFERENCES photos(id),
            UNIQUE(id_user, id_photo)
        );
            `
    );
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  } finally {
    if (connect) {
      connect.release();
    }
    process.exit(0);
  }
}

initDB();
