// const mongoose = require("mongoose");
// require("dotenv").config();

// const connectDb = async () => {
//   try {
//     const conn = await mongoose.connect(
//       "mongodb://asifshah1129_db_user:Q0LVk8EnFQLnT0U1@ac-nkpkcmo-shard-00-00.yvyhpxi.mongodb.net:27017,ac-nkpkcmo-shard-00-01.yvyhpxi.mongodb.net:27017,ac-nkpkcmo-shard-00-02.yvyhpxi.mongodb.net:27017/?ssl=true&replicaSet=atlas-3sqv9o-shard-0&authSource=admin&appName=interview-ai",
//     );

//     console.log(`MongoDB Connected: ${conn.connection.host}`);
//   } catch (error) {
//     console.log("MongoDB Connection Error:", error.message);

//     process.exit(1);
//   }
// };
// module.exports = connectDb;

// const conn = await mongoose.connect(
//     "mongodb+srv://asifshah1129_db_user:Q0LVk8EnFQLnT0U1@interview-ai.yvyhpxi.mongodb.net/interview-mastery",
//   );

const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDb;
