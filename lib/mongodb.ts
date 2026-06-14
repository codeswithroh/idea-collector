import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

let clientPromise: Promise<MongoClient>;

function getClientPromise(): Promise<MongoClient> {
  if (!clientPromise) {
    if (!uri) {
      throw new Error("Please add your MongoDB URI to .env.local");
    }
    const client = new MongoClient(uri);
    clientPromise = client.connect();
  }
  return clientPromise;
}

export default getClientPromise;
