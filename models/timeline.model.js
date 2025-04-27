import mongoose from "mongoose";

const timelineSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Role required"],
  },
  where: {
    companyName: {
      type: String,
      required: [true, "Company/team name is required"],
    },
    link: String,
  },
  description: {
    type: String,
    required: [true, "Description required"],
  },
  timeline: {
    from: {
      type: String,
      required: [true, "Starting date is required"],
    },
    to: String,
  },
});

export const Timeline = mongoose.model("Timeline", timelineSchema);
