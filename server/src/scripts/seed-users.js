import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import AI_Author from "../models/ai.model.js";
import { usersData, aiAuthorsData, COMMON_PASSWORD } from "./mockdata/users.mock.js";

export async function seedUsers() {
  console.log("--- Seeding Users ---");

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(COMMON_PASSWORD, salt);

  const createdUsers = [];

  for (const data of usersData) {
    const existing = await User.findOne({ username: data.username });
    if (existing) {
      console.log(`  User "${data.username}" already exists, skipping.`);
      createdUsers.push(existing);
      continue;
    }

    const user = await User.create({
      ...data,
      password: hashedPassword,
    });
    console.log(`  Created user: ${user.username} (${user._id})`);
    createdUsers.push(user);
  }

  console.log(`  Total users: ${createdUsers.length}\n`);
  return createdUsers;
}

export async function seedAIAuthors() {
  console.log("--- Seeding AI Authors ---");

  const createdAuthors = [];

  for (const data of aiAuthorsData) {
    const existing = await AI_Author.findOne({ name: data.name });
    if (existing) {
      console.log(`  AI Author "${data.name}" already exists, skipping.`);
      createdAuthors.push(existing);
      continue;
    }

    const author = await AI_Author.create(data);
    console.log(`  Created AI author: ${author.name} (${author._id})`);
    createdAuthors.push(author);
  }

  console.log(`  Total AI authors: ${createdAuthors.length}\n`);
  return createdAuthors;
}
