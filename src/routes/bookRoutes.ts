
// import express from "express";
// import { ObjectId, Collection, Document } from "mongodb";
// import verifySession from "../middleware/verifySession.js";

// const router = express.Router();

// let booksCollection: Collection<Document>;
// let borrowsCollection: Collection<Document>;

// export const setBooksCollection = (collection: Collection<Document>) => {
//   booksCollection = collection;
// };

// export const setBorrowsCollection = (collection: Collection<Document>) => {
//   borrowsCollection = collection;
// };

// // GET: My Books
// router.get("/my-books", verifySession, async (req, res) => {
//   try {
//     const books = await booksCollection
//       .find({ userEmail: req.user.email })
//       .sort({ _id: -1 })
//       .toArray();

//     res.status(200).json(books);
//   } catch (error) {
//     console.error("My books error:", error);
//     res.status(500).json({
//       message: "Failed to load your books.",
//     });
//   }
// });

// // POST: Add Book
// router.post("/books", verifySession, async (req, res) => {
//   try {
//     const {
//       title,
//       author,
//       category,
//       image,
//       description,
//       totalCopies,
//     } = req.body;

//     const copies = Number(totalCopies);

//     if (
//       !title?.trim() ||
//       !author?.trim() ||
//       !category ||
//       !description?.trim() ||
//       !Number.isInteger(copies) ||
//       copies < 1
//     ) {
//       res.status(400).json({
//         message: "Please provide all required book information.",
//       });
//       return;
//     }

//     const newBook = {
//       title: title.trim(),
//       author: author.trim(),
//       category,
//       image: image?.trim() || "",
//       description: description.trim(),
//       userName: req.user.name || "",
//       userEmail: req.user.email,
//       totalCopies: copies,
//       availableCopies: copies,
//       createdAt: new Date(),
//     };

//     const result = await booksCollection.insertOne(newBook);

//     res.status(201).json({
//       message: "Book added successfully!",
//       insertedId: result.insertedId,
//     });
//   } catch (error) {
//     console.error("Add book error:", error);
//     res.status(500).json({
//       message: "Failed to add book.",
//     });
//   }
// });

// // GET: Single Book Details
// router.get("/books/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (typeof id !== "string" || !ObjectId.isValid(id)) {
//       res.status(400).json({
//         message: "Invalid book ID.",
//       });
//       return;
//     }

//     const book = await booksCollection.findOne({
//       _id: new ObjectId(id),
//     });

//     if (!book) {
//       res.status(404).json({
//         message: "Book not found.",
//       });
//       return;
//     }

//     res.status(200).json(book);
//   } catch (error) {
//     console.error("Book details error:", error);
//     res.status(500).json({
//       message: "Failed to load book details.",
//     });
//   }
// });

// // POST: Borrow Book
// router.post("/borrows", verifySession, async (req, res) => {
//   console.log("BORROW API CALLED");

//   try {
//     const {
//       bookId,
//       borrowDate,
//       returnDate,
//     } = req.body;

//     const userEmail = req.user.email;

//     // Validate required information
//     if (
//       typeof bookId !== "string" ||
//       !ObjectId.isValid(bookId) ||
//       !borrowDate ||
//       !returnDate
//     ) {
//       res.status(400).json({
//         message: "Please provide all required information.",
//       });
//       return;
//     }

//     // Validate dates
//     const borrowTime = Date.parse(borrowDate);
//     const returnTime = Date.parse(returnDate);

//     if (
//       Number.isNaN(borrowTime) ||
//       Number.isNaN(returnTime) ||
//       returnTime <= borrowTime
//     ) {
//       res.status(400).json({
//         message: "Return date must be after borrow date.",
//       });
//       return;
//     }

//     const bookObjectId = new ObjectId(bookId);

//     // Check whether the user already borrowed this book
//     const existingBorrow = await borrowsCollection.findOne({
//       bookId: bookObjectId,
//       userEmail,
//     });

//     if (existingBorrow) {
//       res.status(400).json({
//         message: "You have already borrowed this book.",
//       });
//       return;
//     }

//     // Check whether the book exists
//     const existingBook = await booksCollection.findOne({
//       _id: bookObjectId,
//     });

//     if (!existingBook) {
//       res.status(404).json({
//         message: "Book not found.",
//       });
//       return;
//     }

//     // Debug information
//     console.log("Borrow check:", {
//       bookId,
//       totalCopies: existingBook.totalCopies,
//       availableCopies: existingBook.availableCopies,
//     });

//     console.log("Borrow Debug:", {
//       bookId,
//       bookObjectId,
//       existingBook,
//       totalCopies: existingBook?.totalCopies,
//       availableCopies: existingBook?.availableCopies,
//     });

//     // If availableCopies is missing, use totalCopies.
//     const updateResult = await booksCollection.updateOne(
//       {
//         _id: bookObjectId,
//         $expr: {
//           $gt: [
//             {
//               $ifNull: ["$availableCopies", "$totalCopies"],
//             },
//             0,
//           ],
//         },
//       },
//       [
//         {
//           $set: {
//             availableCopies: {
//               $subtract: [
//                 {
//                   $ifNull: ["$availableCopies", "$totalCopies"],
//                 },
//                 1,
//               ],
//             },
//           },
//         },
//       ]
//     );

//     console.log("Update Result:", {
//       matchedCount: updateResult.matchedCount,
//       modifiedCount: updateResult.modifiedCount,
//     });

//     if (updateResult.matchedCount === 0) {
//       res.status(400).json({
//         message: "No copies are currently available.",
//       });
//       return;
//     }

//     // Save borrow information using database book details
//     const borrowData = {
//       bookId: bookObjectId,
//       bookTitle: existingBook.title,
//       bookImage: existingBook.image || "",
//       userEmail,
//       borrowDate,
//       returnDate,
//       createdAt: new Date(),
//     };

//     try {
//       const result = await borrowsCollection.insertOne(borrowData);

//       res.status(201).json({
//         message: "Book borrowed successfully!",
//         insertedId: result.insertedId,
//       });
//     } catch (insertError) {
//       // Restore the copy if borrow record could not be saved
//       await booksCollection.updateOne(
//         { _id: bookObjectId },
//         { $inc: { availableCopies: 1 } }
//       );

//       throw insertError;
//     }
//   } catch (error) {
//     console.error("Borrow book error:", error);
//     res.status(500).json({
//       message: "Failed to borrow book.",
//     });
//   }
// });

// // GET: My Borrowed Books
// router.get("/borrows", verifySession, async (req, res) => {
//   try {
//     const borrows = await borrowsCollection
//       .find({ userEmail: req.user.email })
//       .sort({ _id: -1 })
//       .toArray();

//     res.status(200).json(borrows);
//   } catch (error) {
//     console.error("Get borrows error:", error);
//     res.status(500).json({
//       message: "Failed to load borrowed books.",
//     });
//   }
// });

// // DELETE: Return Book
// router.delete("/borrows/:id", verifySession, async (req, res) => {
//   try {
//     console.log("RETURN API CALLED");

//     const { id } = req.params;

//     if (typeof id !== "string" || !ObjectId.isValid(id)) {
//       res.status(400).json({
//         message: "Invalid borrow ID.",
//       });
//       return;
//     }

//     const borrowObjectId = new ObjectId(id);

//     const borrow = await borrowsCollection.findOne({
//       _id: borrowObjectId,
//       userEmail: req.user.email,
//     });

//     if (!borrow) {
//       res.status(404).json({
//         message: "Borrow record not found.",
//       });
//       return;
//     }

//     const bookObjectId =
//       borrow.bookId instanceof ObjectId
//         ? borrow.bookId
//         : new ObjectId(String(borrow.bookId));

//     // Delete the borrow record
//     await borrowsCollection.deleteOne({
//       _id: borrowObjectId,
//       userEmail: req.user.email,
//     });

//     // Increase available copies
//     const returnUpdateResult = await booksCollection.updateOne(
//       { _id: bookObjectId },
//       { $inc: { availableCopies: 1 } }
//     );

//     console.log("Return Update Result:", {
//       matchedCount: returnUpdateResult.matchedCount,
//       modifiedCount: returnUpdateResult.modifiedCount,
//     });

//     res.status(200).json({
//       message: "Book returned successfully!",
//     });
//   } catch (error) {
//     console.error("Return book error:", error);
//     res.status(500).json({
//       message: "Failed to return book.",
//     });
//   }
// });

// // PATCH: Update Book
// router.patch("/books/:id", verifySession, async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (typeof id !== "string" || !ObjectId.isValid(id)) {
//       res.status(400).json({
//         message: "Invalid book ID.",
//       });
//       return;
//     }

//     const {
//       title,
//       author,
//       category,
//       image,
//       description,
//       totalCopies,
//     } = req.body;

//     const copies = Number(totalCopies);

//     if (
//       !title?.trim() ||
//       !author?.trim() ||
//       !category ||
//       !description?.trim() ||
//       !Number.isInteger(copies) ||
//       copies < 1
//     ) {
//       res.status(400).json({
//         message: "Please provide valid book information.",
//       });
//       return;
//     }

//     const bookObjectId = new ObjectId(id);

//     const book = await booksCollection.findOne({
//       _id: bookObjectId,
//       userEmail: req.user.email,
//     });

//     if (!book) {
//       res.status(404).json({
//         message: "Book not found or you are not authorized.",
//       });
//       return;
//     }

//     const oldTotalCopies = Number(book.totalCopies);

//     const oldAvailableCopies =
//       book.availableCopies == null
//         ? oldTotalCopies
//         : Number(book.availableCopies);

//     const borrowedCopies = oldTotalCopies - oldAvailableCopies;

//     if (copies < borrowedCopies) {
//       res.status(400).json({
//         message: "Total copies cannot be less than borrowed copies.",
//       });
//       return;
//     }

//     const updatedBook = {
//       title: title.trim(),
//       author: author.trim(),
//       category,
//       image: image?.trim() || "",
//       description: description.trim(),
//       totalCopies: copies,
//       availableCopies: copies - borrowedCopies,
//     };

//     await booksCollection.updateOne(
//       {
//         _id: bookObjectId,
//         userEmail: req.user.email,
//       },
//       {
//         $set: updatedBook,
//       }
//     );

//     res.status(200).json({
//       message: "Book updated successfully!",
//     });
//   } catch (error) {
//     console.error("Update book error:", error);
//     res.status(500).json({
//       message: "Failed to update book.",
//     });
//   }
// });

// // DELETE: Delete Book
// router.delete("/books/:id", verifySession, async (req, res) => {
//   try {
    
//     const { id } = req.params;

//     if (typeof id !== "string" || !ObjectId.isValid(id)) {
//       res.status(400).json({
//         message: "Invalid book ID.",
//       });
//       return;
//     }

//     const bookObjectId = new ObjectId(id);

//     const book = await booksCollection.findOne({
//       _id: bookObjectId,
//       userEmail: req.user.email,
//     });

//     if (!book) {
//       res.status(404).json({
//         message: "Book not found or you are not authorized.",
//       });
//       return;
//     }

//     const activeBorrows = await borrowsCollection.countDocuments({
//       bookId: bookObjectId,
//     });

//     if (activeBorrows > 0) {
//       res.status(400).json({
//         message:
//           "This book cannot be deleted because it is currently borrowed.",
//       });
//       return;
//     }

//     await booksCollection.deleteOne({
//       _id: bookObjectId,
//       userEmail: req.user.email,
//     });

//     res.status(200).json({
//       message: "Book deleted successfully!",
//     });
//   } catch (error) {
//     console.error("Delete book error:", error);
//     res.status(500).json({
//       message: "Failed to delete book.",
//     });
//   }
// });

// export default router;






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

