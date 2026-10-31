import express from 'express';

const router = express.Router();

let booksCollection;

export const setBooksCollection = (collection) => {
  booksCollection = collection;
};

// Get books added by a specific user
router.get('/my-books', async (req, res) => {
  try {
    const email = req.query.email;

    if (!email) {
      return res.status(400).json({
        message: 'User email is required.',
      });
    }

    const books = await booksCollection
      .find({ userEmail: email })
      .sort({ _id: -1 })
      .toArray();

    res.status(200).json(books);
  } catch (error) {
    console.error('My books error:', error);

    res.status(500).json({
      message: 'Failed to load your books.',
    });
  }
});

export default router;