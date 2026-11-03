
import express from "express";
import { ObjectId } from "mongodb";
import verifySession from "../middleware/verifySession.js";
import { booksCollection, borrowsCollection } from "../config/collections.js";

const router = express.Router();

// GET: My Books
router.get("/my-books", verifySession, async (req, res) => {
  try {
    const books = await booksCollection
      .find({ userEmail: req.user.email })
      .sort({ _id: -1 })
      .toArray();

    res.status(200).json(books);
  } catch (error) {
    console.error("My books error:", error);
    res.status(500).json({
      message: "Failed to load your books.",
    });
  }
});

// POST: Add Book
router.post("/books", verifySession, async (req, res) => {
  try {
    const {
      title,
      author,
      category,
      image,
      description,
      totalCopies,
    } = req.body;

    const copies = Number(totalCopies);

    if (
      !title?.trim() ||
      !author?.trim() ||
      !category ||
      !description?.trim() ||
      !Number.isInteger(copies) ||
      copies < 1
    ) {
      res.status(400).json({
        message: "Please provide all required book information.",
      });
      return;
    }

    const newBook = {
      title: title.trim(),
      author: author.trim(),
      category,
      image: image?.trim() || "",
      description: description.trim(),
      userName: req.user.name || "",
      userEmail: req.user.email,
      totalCopies: copies,
      availableCopies: copies,
      createdAt: new Date(),
    };

    const result = await booksCollection.insertOne(newBook);

    res.status(201).json({
      message: "Book added successfully!",
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error("Add book error:", error);
    res.status(500).json({
      message: "Failed to add book.",
    });
  }
});

// GET: Single Book Details
router.get("/books/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (typeof id !== "string" || !ObjectId.isValid(id)) {
      res.status(400).json({
        message: "Invalid book ID.",
      });
      return;
    }

    const book = await booksCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!book) {
      res.status(404).json({
        message: "Book not found.",
      });
      return;
    }

    res.status(200).json(book);
  } catch (error) {
    console.error("Book details error:", error);
    res.status(500).json({
      message: "Failed to load book details.",
    });
  }
});

// PATCH: Update Book
router.patch("/books/:id", verifySession, async (req, res) => {
  try {
    const { id } = req.params;

    if (typeof id !== "string" || !ObjectId.isValid(id)) {
      res.status(400).json({
        message: "Invalid book ID.",
      });
      return;
    }

    const {
      title,
      author,
      category,
      image,
      description,
      totalCopies,
    } = req.body;

    const copies = Number(totalCopies);

    if (
      !title?.trim() ||
      !author?.trim() ||
      !category ||
      !description?.trim() ||
      !Number.isInteger(copies) ||
      copies < 1
    ) {
      res.status(400).json({
        message: "Please provide valid book information.",
      });
      return;
    }

    const bookObjectId = new ObjectId(id);

    const book = await booksCollection.findOne({
      _id: bookObjectId,
      userEmail: req.user.email,
    });

    if (!book) {
      res.status(404).json({
        message: "Book not found or you are not authorized.",
      });
      return;
    }

    const oldTotalCopies = Number(book.totalCopies);

    const oldAvailableCopies =
      book.availableCopies == null
        ? oldTotalCopies
        : Number(book.availableCopies);

    const borrowedCopies = oldTotalCopies - oldAvailableCopies;

    if (copies < borrowedCopies) {
      res.status(400).json({
        message: "Total copies cannot be less than borrowed copies.",
      });
      return;
    }

    const updatedBook = {
      title: title.trim(),
      author: author.trim(),
      category,
      image: image?.trim() || "",
      description: description.trim(),
      totalCopies: copies,
      availableCopies: copies - borrowedCopies,
    };

    await booksCollection.updateOne(
      {
        _id: bookObjectId,
        userEmail: req.user.email,
      },
      {
        $set: updatedBook,
      }
    );

    res.status(200).json({
      message: "Book updated successfully!",
    });
  } catch (error) {
    console.error("Update book error:", error);
    res.status(500).json({
      message: "Failed to update book.",
    });
  }
});

// DELETE: Delete Book
router.delete("/books/:id", verifySession, async (req, res) => {
  try {
    const { id } = req.params;

    if (typeof id !== "string" || !ObjectId.isValid(id)) {
      res.status(400).json({
        message: "Invalid book ID.",
      });
      return;
    }

    const bookObjectId = new ObjectId(id);

    const book = await booksCollection.findOne({
      _id: bookObjectId,
      userEmail: req.user.email,
    });

    if (!book) {
      res.status(404).json({
        message: "Book not found or you are not authorized.",
      });
      return;
    }

    const activeBorrows = await borrowsCollection.countDocuments({
      bookId: bookObjectId,
    });

    if (activeBorrows > 0) {
      res.status(400).json({
        message:
          "This book cannot be deleted because it is currently borrowed.",
      });
      return;
    }

    await booksCollection.deleteOne({
      _id: bookObjectId,
      userEmail: req.user.email,
    });

    res.status(200).json({
      message: "Book deleted successfully!",
    });
  } catch (error) {
    console.error("Delete book error:", error);
    res.status(500).json({
      message: "Failed to delete book.",
    });
  }
});

export default router;


