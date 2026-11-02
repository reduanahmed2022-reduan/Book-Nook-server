
import express from "express";
import { ObjectId } from "mongodb";
import verifySession from "../middleware/verifySession.js";
import { booksCollection, borrowsCollection } from "../config/collections.js";

const router = express.Router();

// POST: Borrow Book
router.post("/borrows", verifySession, async (req, res) => {
  try {
    const { bookId, borrowDate, returnDate } = req.body;
    const userEmail = req.user.email;

    if (
      typeof bookId !== "string" ||
      !ObjectId.isValid(bookId) ||
      !borrowDate ||
      !returnDate
    ) {
      res.status(400).json({
        message: "Please provide all required information.",
      });
      return;
    }

    const borrowTime = Date.parse(borrowDate);
    const returnTime = Date.parse(returnDate);

    if (
      Number.isNaN(borrowTime) ||
      Number.isNaN(returnTime) ||
      returnTime <= borrowTime
    ) {
      res.status(400).json({
        message: "Return date must be after borrow date.",
      });
      return;
    }

    const bookObjectId = new ObjectId(bookId);

    // Check existing borrow
    const existingBorrow = await borrowsCollection.findOne({
      bookId: bookObjectId,
      userEmail,
    });

    if (existingBorrow) {
      res.status(400).json({
        message: "You have already borrowed this book.",
      });
      return;
    }

    // Check book exists
    const existingBook = await booksCollection.findOne({
      _id: bookObjectId,
    });

    if (!existingBook) {
      res.status(404).json({
        message: "Book not found.",
      });
      return;
    }

    // Decrease available copies
    const updateResult = await booksCollection.updateOne(
      {
        _id: bookObjectId,
        $expr: {
          $gt: [
            {
              $ifNull: ["$availableCopies", "$totalCopies"],
            },
            0,
          ],
        },
      },
      [
        {
          $set: {
            availableCopies: {
              $subtract: [
                {
                  $ifNull: ["$availableCopies", "$totalCopies"],
                },
                1,
              ],
            },
          },
        },
      ]
    );

    if (updateResult.matchedCount === 0) {
      res.status(400).json({
        message: "No copies are currently available.",
      });
      return;
    }

    const borrowData = {
      bookId: bookObjectId,
      bookTitle: existingBook.title,
      bookImage: existingBook.image || "",
      userEmail,
      borrowDate,
      returnDate,
      createdAt: new Date(),
    };

    try {
      const result = await borrowsCollection.insertOne(borrowData);

      res.status(201).json({
        message: "Book borrowed successfully!",
        insertedId: result.insertedId,
      });
    } catch (insertError) {
      // Restore copy if borrow record fails
      await booksCollection.updateOne(
        { _id: bookObjectId },
        { $inc: { availableCopies: 1 } }
      );

      throw insertError;
    }
  } catch (error) {
    console.error("Borrow book error:", error);
    res.status(500).json({
      message: "Failed to borrow book.",
    });
  }
});

// GET: My Borrowed Books
router.get("/borrows", verifySession, async (req, res) => {
  try {
    const borrows = await borrowsCollection
      .find({ userEmail: req.user.email })
      .sort({ _id: -1 })
      .toArray();

    res.status(200).json(borrows);
  } catch (error) {
    console.error("Get borrows error:", error);
    res.status(500).json({
      message: "Failed to load borrowed books.",
    });
  }
});

// DELETE: Return Book
router.delete("/borrows/:id", verifySession, async (req, res) => {
  try {
    const { id } = req.params;

    if (typeof id !== "string" || !ObjectId.isValid(id)) {
      res.status(400).json({
        message: "Invalid borrow ID.",
      });
      return;
    }

    const borrowObjectId = new ObjectId(id);

    const borrow = await borrowsCollection.findOne({
      _id: borrowObjectId,
      userEmail: req.user.email,
    });

    if (!borrow) {
      res.status(404).json({
        message: "Borrow record not found.",
      });
      return;
    }

    const bookObjectId =
      borrow.bookId instanceof ObjectId
        ? borrow.bookId
        : new ObjectId(String(borrow.bookId));

    // Delete borrow record
    await borrowsCollection.deleteOne({
      _id: borrowObjectId,
      userEmail: req.user.email,
    });

    // Increase available copies
    const returnUpdateResult = await booksCollection.updateOne(
      { _id: bookObjectId },
      { $inc: { availableCopies: 1 } }
    );

    console.log("Return Update Result:", {
      matchedCount: returnUpdateResult.matchedCount,
      modifiedCount: returnUpdateResult.modifiedCount,
    });

    res.status(200).json({
      message: "Book returned successfully!",
    });
  } catch (error) {
    console.error("Return book error:", error);
    res.status(500).json({
      message: "Failed to return book.",
    });
  }
});

export default router;
