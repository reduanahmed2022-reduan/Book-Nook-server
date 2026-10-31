
import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import 'dotenv/config';

const app = express();
const PORT = 5000;

app.use(cors({
  origin: 'http://localhost:3000',
}));

app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URI);

let booksCollection;

async function connectToMongoDB() {
  try {
    await client.connect();

    const database = client.db('Book-Nook');
    booksCollection = database.collection('books');

    console.log('You successfully connected to MongoDB!');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
}

app.get('/', (req, res) => {
  res.send({ message: 'Server is running fine!' });
});

// Get latest books
app.get('/books', async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 6;

    const books = await booksCollection
      .find()
      .sort({ _id: -1 })
      .limit(limit)
      .toArray();

    res.status(200).json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to load books',
    });
  }
});

connectToMongoDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running at ${PORT}`);
  });
});
