#!/usr/bin/env node

// node cli that adds users to db.json
// use sys argv
// use only native node modules

const fs = require("fs");
const path = require("path");
const util = require("util");


const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const dbPath = path.join(__dirname, "db.json");

// check if db.json exists
// if not, create it
const checkDB = async () => {
  try {
    await readFile(dbPath);
  } catch (err) {
    if (err.code === "ENOENT") {
      await writeFile(dbPath, "[]");
    } else {
      throw err;
    }
  }
};

const randomId = () => {
    return Math.floor(Math.random() * 100000);
}

const validateEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

const addUser = async (user) => {
  await checkDB();
  const db = await readFile(dbPath);
  const users = JSON.parse(db);
  users.push(user);
  await writeFile(dbPath, JSON.stringify(users));
};

const usage = () => {
  console.log("Usage: edu <firstname> <lastname> <email>");
};

const main = async () => {
  if (process.argv.length !== 5) {
    usage();
    process.exit(1);
  }

  const [, , firstname, lastname, email] = process.argv;

  if (!validateEmail(email)) {
    console.log("Invalid email");
    process.exit(1);
  }

  if(firstname.length < 3 || lastname.length < 3) {
    console.log("Firstname and lastname must be at least 3 characters long");
    process.exit(1);
  }

  const user = {
    id: randomId(),
    firstname,
    lastname,
    email,
  };

  await addUser(user);
};

main();
