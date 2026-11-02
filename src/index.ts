
import express, { Request, Response } from "express";
import cors from "cors";
import { MongoClient, Collection, Document } from "mongodb";
import "dotenv/config";
import bookRoutes, {
    setBooksCollection,
    setBorrowsCollection,
} from "./routes/bookRoutes.js";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    })
);

app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is missing");
}

const client = new MongoClient(MONGODB_URI);

let booksCollection: Collection<Document>;

let borrowsCollection: Collection<Document>;

async function connectToMongoDB(): Promise<void> {
    await client.connect();

    const database = client.db("Book-Nook");

    booksCollection = database.collection("books");
    borrowsCollection = database.collection("borrows");

    setBooksCollection(booksCollection);
    setBorrowsCollection(borrowsCollection);

    console.log("MongoDB connected successfully!");
}

// Home Route
app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        message: "Server is running fine!",
    });
});

// Get Books
app.get("/books", async (req: Request, res: Response) => {
  try {
    const requestedLimit = Number(req.query.limit);

    let query = booksCollection.find().sort({ _id: -1 });

    if (req.query.limit !== undefined) {
      if (
        !Number.isInteger(requestedLimit) ||
        requestedLimit < 1
      ) {
        return res.status(400).json({
          message: "Invalid limit.",
        });
      }

      query = query.limit(requestedLimit);
    }

    const books = await query.toArray();

    return res.status(200).json(books);
  } catch (error) {
    console.error("Get books error:", error);

    return res.status(500).json({
      message: "Failed to load books.",
    });
  }
});

// Register Book Routes
app.use("/", bookRoutes);

// Start Server
connectToMongoDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running at ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Server failed to start:", error);
        process.exit(1);
    });
