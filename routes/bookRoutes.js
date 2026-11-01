
import express from 'express';
import { ObjectId } from 'mongodb';
import verifySession from '../middleware/verifySession.js';

const router = express.Router();

let booksCollection;
let borrowsCollection;

export const setBooksCollection = (collection) => {
  booksCollection = collection;
};

export const setBorrowsCollection = (collection) => {
  borrowsCollection = collection;
};

// GET: All books added by a specific user
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

// GET: Single book details
router.get('/books/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid book ID.',
      });
    }

    const book = await booksCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!book) {
      return res.status(404).json({
        message: 'Book not found.',
      });
    }

    res.status(200).json(book);
  } catch (error) {
    console.error('Book details error:', error);

    res.status(500).json({
      message: 'Failed to load book details.',
    });
  }
});

// POST: Borrow a book
router.post('/borrows', verifySession, async (req, res) => {
  try {
     console.log('Borrow request received');
    console.log('Borrows collection:', !!borrowsCollection);
    const {
  bookId,
  bookTitle,
  bookImage,
  borrowDate,
  returnDate,
} = req.body;

const userEmail = req.user.email;

    if (
      !bookId ||
      !ObjectId.isValid(bookId) ||
      !userEmail ||
      !borrowDate ||
      !returnDate
    ) {
      return res.status(400).json({
        message: 'Please provide all required information.',
      });
    }

    if (returnDate <= borrowDate) {
      return res.status(400).json({
        message: 'Return date must be after borrow date.',
      });
    }

    const book = await booksCollection.findOne({
      _id: new ObjectId(bookId),
    });

    if (!book) {
      return res.status(404).json({
        message: 'Book not found.',
      });
    }

    const availableCopies =
      book.availableCopies ?? book.totalCopies;

    if (availableCopies <= 0) {
      return res.status(400).json({
        message: 'This book is not available.',
      });
    }

    // Decrease available copies
    const updateResult = await booksCollection.updateOne(
      {
        _id: new ObjectId(bookId),
        $or: [
          { availableCopies: { $gt: 0 } },
          {
            availableCopies: { $exists: false },
            totalCopies: { $gt: 0 },
          },
        ],
      },
      [
        {
          $set: {
            availableCopies: {
              $subtract: [
                { $ifNull: ['$availableCopies', '$totalCopies'] },
                1,
              ],
            },
          },
        },
      ]
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(400).json({
        message: 'No copies are currently available.',
      });
    }

    const borrowData = {
      bookId: new ObjectId(bookId),
      bookTitle,
      bookImage: bookImage || '',
      userEmail,
      borrowDate,
      returnDate,
      createdAt: new Date(),
    };

    const result = await borrowsCollection.insertOne(borrowData);

    res.status(201).json({
      message: 'Book borrowed successfully!',
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error('Borrow book error:', error);

    res.status(500).json({
      message: 'Failed to borrow book.',
    });
  }
});

// GET: All borrowed books of the logged-in user
router.get('/borrows', verifySession, async (req, res) => {
  try {
    const borrows = await borrowsCollection
      .find({ userEmail: req.user.email })
      .sort({ _id: -1 })
      .toArray();

    res.status(200).json(borrows);
  } catch (error) {
    console.error('Get borrows error:', error);

    res.status(500).json({
      message: 'Failed to load borrowed books.',
    });
  }
});

// DELETE: Return a borrowed book
router.delete('/borrows/:id', verifySession, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid borrow ID.',
      });
    }

    const borrow = await borrowsCollection.findOne({
      _id: new ObjectId(id),
      userEmail: req.user.email,
    });

    if (!borrow) {
      return res.status(404).json({
        message: 'Borrow record not found.',
      });
    }

    // Delete the borrow record
    await borrowsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    // Increase available copies
    await booksCollection.updateOne(
      { _id: new ObjectId(borrow.bookId) },
      { $inc: { availableCopies: 1 } }
    );

    res.status(200).json({
      message: 'Book returned successfully!',
    });
  } catch (error) {
    console.error('Return book error:', error);

    res.status(500).json({
      message: 'Failed to return book.',
    });
  }
});
 
// PATCH: Update a book added by the logged-in user
router.patch('/books/:id', verifySession, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid book ID.',
      });
    }

    const {
      title,
      author,
      category,
      image,
      description,
      totalCopies,
    } = req.body;

    if (
      !title ||
      !author ||
      !category ||
      !description ||
      !Number.isInteger(totalCopies) ||
      totalCopies < 1
    ) {
      return res.status(400).json({
        message: 'Please provide valid book information.',
      });
    }

    // Find the book owned by the logged-in user
    const book = await booksCollection.findOne({
      _id: new ObjectId(id),
      userEmail: req.user.email,
    });

    if (!book) {
      return res.status(404).json({
        message: 'Book not found or you are not authorized.',
      });
    }

    // Calculate how many copies are currently borrowed
    const oldTotalCopies = book.totalCopies;
    const oldAvailableCopies =
      book.availableCopies ?? book.totalCopies;

    const borrowedCopies = oldTotalCopies - oldAvailableCopies;

    if (totalCopies < borrowedCopies) {
      return res.status(400).json({
        message: 'Total copies cannot be less than borrowed copies.',
      });
    }

    const updatedBook = {
      title,
      author,
      category,
      image: image || '',
      description,
      totalCopies,
      availableCopies: totalCopies - borrowedCopies,
    };

    await booksCollection.updateOne(
      {
        _id: new ObjectId(id),
        userEmail: req.user.email,
      },
      {
        $set: updatedBook,
      }
    );

    res.status(200).json({
      message: 'Book updated successfully!',
    });
  } catch (error) {
    console.error('Update book error:', error);

    res.status(500).json({
      message: 'Failed to update book.',
    });
  }
});

// DELETE: Delete a book added by the logged-in user
router.delete('/books/:id', verifySession, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid book ID.',
      });
    }

    // Find the book owned by the logged-in user
    const book = await booksCollection.findOne({
      _id: new ObjectId(id),
      userEmail: req.user.email,
    });

    if (!book) {
      return res.status(404).json({
        message: 'Book not found or you are not authorized.',
      });
    }

    // Check whether this book has active borrow records
    const activeBorrows = await borrowsCollection.countDocuments({
      bookId: new ObjectId(id),
    });

    if (activeBorrows > 0) {
      return res.status(400).json({
        message: 'This book cannot be deleted because it is currently borrowed.',
      });
    }

    await booksCollection.deleteOne({
      _id: new ObjectId(id),
      userEmail: req.user.email,
    });

    res.status(200).json({
      message: 'Book deleted successfully!',
    });
  } catch (error) {
    console.error('Delete book error:', error);

    res.status(500).json({
      message: 'Failed to delete book.',
    });
  }
});

export default router;
