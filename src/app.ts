import express from "express";
import morgan from "morgan";
import cors from "cors";
import "reflect-metadata";
import { createConnection, getRepository } from 'typeorm';
import cron from 'node-cron'
import get from 'axios'
import { Character } from "./entity/Character";

// Create a new express application instance
const app: express.Application = express();

// Connects to the Database
createConnection();

// Settings
app.set("port", process.env.PORT || 3000);

// Middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Cron job run every 30 minutes
cron.schedule("*/30 * * * *", async () => {
  // Calculate a random number between 1 and 2138
  const random = Math.floor(Math.random() * (2139 - 1) + 1);
  // Get character from API
  await get('https://anapioficeandfire.com/api/characters/' + random)
    .then(async (response) => {
      // console.log(random + " - " + (response.data.name ? response.data.name : response.data.aliases[0]) + " - " + response.data.gender);
      // Creating a new Character Object
      const character = new Character();
      character.name = response.data.name ? response.data.name : response.data.aliases[0];
      character.gender = response.data.gender;
      const newCharacter = await getRepository(Character).create(character);
      // Saving the Character Object in PostgreSQL
      await getRepository(Character).save(newCharacter);
    })
    .catch((error) => {
      console.log(error);
    });
});

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to my cron job",
  });
});

export default app;