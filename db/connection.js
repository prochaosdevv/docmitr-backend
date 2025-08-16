import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const uri =
  "mongodb+srv://" +
  process.env.DB_USER +
  ":" +
  process.env.DB_PASSWORD +
  "@" +
  process.env.DB_URI +
  "/" +
  process.env.DB_NAME +
  "?retryWrites=true&w=majority";

export const connectDb = () => {
  console.log(process.env.MONGO_URI);
  
  mongoose
    .connect(process.env.MONGO_URI)
    // .connect(uri, {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    // })
    .then((data) => {
      console.log(`mongodb connect with server ${data.connection.host}`);
    })
    .catch((err) => {
      console.log(err); 
    });
};
