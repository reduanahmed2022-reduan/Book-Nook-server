
import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import 'dotenv/config';


import bookRoutes, {
    setBooksCollection,
    setBorrowsCollection,
} from './routes/bookRoutes.js';

const app = express();
const PORT = 5000;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URI);

let booksCollection;
let borrowsCollection;

// MongoDB Connection
async function connectToMongoDB() {
    try {
        await client.connect();

        const database = client.db('Book-Nook');

        booksCollection = database.collection('books');
        borrowsCollection = database.collection('borrows');

        // Connect collections with bookRoutes
        setBooksCollection(booksCollection);
        setBorrowsCollection(borrowsCollection);

        console.log('You successfully connected to MongoDB!');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        throw err;
    }
}

// Home Route
app.get('/', (req, res) => {
    res.send({
        message: 'Server is running fine!',
    });
});

// Get Latest Books
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

// Add a New Book
app.post('/books', async (req, res) => {
    try {
        const {
            title,
            author,
            category,
            image,
            description,
            userName,
            userEmail,
            totalCopies,
        } = req.body;

        if (
            !title?.trim() ||
            !author?.trim() ||
            !category ||
            !description?.trim() ||
            !userName?.trim() ||
            !userEmail?.trim() ||
            !Number.isInteger(Number(totalCopies)) ||
            Number(totalCopies) < 1
        ) {
            return res.status(400).json({
                message: 'Please provide all required book information.',
            });
        }

        const newBook = {
            title: title.trim(),
            author: author.trim(),
            category,
            image: image?.trim() || '',
            description: description.trim(),
            userName: userName.trim(),
            userEmail: userEmail.trim(),
            totalCopies: Number(totalCopies),
            createdAt: new Date(),
        };

        const result = await booksCollection.insertOne(newBook);

        res.status(201).json({
            message: 'Book added successfully!',
            insertedId: result.insertedId,
        });

    } catch (error) {
        console.error('Add book error:', error);

        res.status(500).json({
            message: 'Failed to add book.',
        });
    }
});

// Book Routes
app.use('/', bookRoutes);

// Start Server After MongoDB Connection
connectToMongoDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running at ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Server failed to start:', error);
        process.exit(1);
    });
