import mongoose from "mongoose";

const VideoContentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
    },

    username: {
      type: String,
      required: true,
    },

    url: {
      type: String,
      required: true,
    },

    title: {
      type: String,
    },

    analyzed_at: {
      type: Date,
      required: true,
    },

    result: {
      notes: String,

      quizzes: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },

      flashcards: String,

      interview_questions: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },

      formulas: String,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },

    lastViewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);



export default mongoose.models.VideoContent ||
  mongoose.model("VideoContent", VideoContentSchema);