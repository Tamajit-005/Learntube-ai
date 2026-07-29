import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  auth0Id: {
    type: String,
    required: true,
    unique: true,
  },

  email: {
    type: String,
    required: true,
  },

  username: {
    type: String,
    required: true,
    unique: true,
  },

  registeredAt: {
    type: Date,
    default: Date.now,
  },

  lastLoginAt: {
    type: Date,
    default: null,
  },
});

export default mongoose.models.User ||
  mongoose.model("User", UserSchema);