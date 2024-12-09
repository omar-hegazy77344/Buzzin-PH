// app/api/getLostItems/route.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

export async function GET(req) {
  try {
    await client.connect();
    const database = client.db("Reports"); // Your MongoDB database
    const returnedCollection = database.collection("Returned");

    const returned = await returnedCollection.find({}).toArray();

    return new Response(JSON.stringify(returned), { status: 200 });
  } catch (error) {
    console.error("Error fetching data:", error);
    return new Response(JSON.stringify({ error: "Failed to load data" }), { status: 500 });
  } finally {
    await client.close();
  }
}
