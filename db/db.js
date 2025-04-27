import mongoose from "mongoose";

const connectDB = () => {
  mongoose
    .connect(process.env.DB_CONNECT, {
      dbName: "portfolio",
    })
    .then(() => {
      console.log("Connected to DB");
    })
    .catch((err) => {
      console.log("Error: ", err);
    });
};
export default connectDB;
