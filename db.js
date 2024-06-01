require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minLength: 3,
    maxLength: 30,
  },
  password: {
    type: String,
    required: true,
    minLength: 8,
    maxLength: 30,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50,
  },
});

// User Schema
userSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) {
    return next();
  }
  try {
    const saltround = await bcrypt.genSalt(11);
    const hash_password = await bcrypt.hash(user.password, saltround);
    user.password = hash_password;
    next();
  } catch (error) {
    next(error);
  }
});

async function hashPassword(next) {
  const update = this.getUpdate();
  if (update.password) {
    try {
      const saltround = 11;
      const salt = await bcrypt.genSalt(saltround);
      update.password = await bcrypt.hash(update.password, salt);
      this.setUpdate(update);
      next();
    } catch (error) {
      next(error);
    }
  }
}

userSchema.pre("findOneAndUpdate", hashPassword);
userSchema.pre("updateOne", hashPassword);

// Bank Schema
const accountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  balance: {
    type: Number,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);
const Account = mongoose.model("Account", accountSchema);

module.exports = {
  User,
  Account,
};
