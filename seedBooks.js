
import { MongoClient } from "mongodb";
import "dotenv/config";

const client = new MongoClient(process.env.MONGODB_URI);

const books = [
  // FICTION
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    category: "Fiction",
    image: "https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg",
    description:
      "A young shepherd travels in search of his personal legend and discovers the meaning of his dreams.",
    userName: "Demo User",
    userEmail: "demo@booknook.com",
    totalCopies: 5,
    createdAt: new Date(),
  },
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    category: "Fiction",
    image: "https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg",
    description:
      "A classic story about wealth, love, dreams and life in the Jazz Age.",
    userName: "Demo User",
    userEmail: "demo@booknook.com",
    totalCopies: 4,
    createdAt: new Date(),
  },
  {
    title: "The Book Thief",
    author: "Markus Zusak",
    category: "Fiction",
    image: "https://covers.openlibrary.org/b/isbn/9780375842207-L.jpg",
    description:
      "A story of courage and humanity during wartime.",
    userName: "Demo User",
    userEmail: "demo@booknook.com",
    totalCopies: 4,
    createdAt: new Date(),
  },
  {
    title: "The Hobbit",
    author: "J. R. R. Tolkien",
    category: "Fiction",
    image: "https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg",
    description:
      "Bilbo Baggins joins an unexpected adventure with dwarves and a wizard.",
    userName: "Demo User",
    userEmail: "demo@booknook.com",
    totalCopies: 6,
    createdAt: new Date(),
  },

  // SCIENCE
  {
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    category: "Science",
    image: "https://covers.openlibrary.org/b/isbn/9780553380163-L.jpg",
    description:
      "An introduction to the universe, black holes, time and modern physics.",
    userName: "Demo User",
    userEmail: "demo@booknook.com",
    totalCopies: 6,
    createdAt: new Date(),
  },
  {
    title: "The Selfish Gene",
    author: "Richard Dawkins",
    category: "Science",
    image: "https://covers.openlibrary.org/b/isbn/9780199291151-L.jpg",
    description:
      "Explores evolution through the perspective of genes.",
    userName: "Demo User",
    userEmail: "demo@booknook.com",
    totalCopies: 3,
    createdAt: new Date(),
  },
  {
    title: "Cosmos",
    author: "Carl Sagan",
    category: "Science",
    image: "https://covers.openlibrary.org/b/isbn/9780345539434-L.jpg",
    description:
      "An exploration of space, science and the universe.",
    userName: "Demo User",
    userEmail: "demo@booknook.com",
    totalCopies: 4,
    createdAt: new Date(),
  },
  {
    title: "The Origin of Species",
    author: "Charles Darwin",
    category: "Science",
    image: "https://covers.openlibrary.org/b/isbn/9780451529060-L.jpg",
    description:
      "A foundational work on evolution.",
    userName: "Demo User",
    userEmail: "demo@booknook.com",
    totalCopies: 2,
    createdAt: new Date(),
  },

  // HISTORY
  {
    title: "Sapiens",
    author: "Yuval Noah Harari",
    category: "History",
    image: "https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg",
    description:
      "An exploration of human history and the development of civilization.",
    userName: "Demo User",
    userEmail: "demo@booknook.com",
    totalCopies: 3,
    createdAt: new Date(),
  },
  {
    title: "Guns, Germs, and Steel",
    author: "Jared Diamond",
    category: "History",
    image: "https://covers.openlibrary.org/b/isbn/9780393354324-L.jpg",
    description:
      "An explanation of how geography and the environment shaped human history.",
    userName: "Demo User",
    userEmail: "demo@booknook.com",
    totalCopies: 4,
    createdAt: new Date(),
  },
  {
    title: "The Diary of a Young Girl",
    author: "Anne Frank",
    category: "History",
    image: "https://covers.openlibrary.org/b/isbn/9780553296983-L.jpg",
    description:
      "The diary of a young girl documenting her life during World War II.",
    userName: "Demo User",
    userEmail: "demo@booknook.com",
    totalCopies: 5,
    createdAt: new Date(),
  },
  {
    title: "Long Walk to Freedom",
    author: "Nelson Mandela",
    category: "History",
    image: "https://covers.openlibrary.org/b/isbn/9780316548182-L.jpg",
    description:
      "The autobiography of Nelson Mandela.",
    userName: "Demo User",
    userEmail: "demo@booknook.com",
    totalCopies: 3,
    createdAt: new Date(),
  },

  // KIDS
  {
    title: "Charlotte's Web",
    author: "E. B. White",
    category: "Kids",
    image: "https://covers.openlibrary.org/b/isbn/9780064400558-L.jpg",
    description:
      "A heartwarming story about friendship between a pig and a spider.",
    userName: "Demo User",
    userEmail: "demo@booknook.com",
    totalCopies: 7,
    createdAt: new Date(),
  },
  {
    title: "Matilda",
    author: "Roald Dahl",
    category: "Kids",
    image: "https://covers.openlibrary.org/b/isbn/9780140328721-L.jpg",
    description:
      "A clever young girl discovers her extraordinary abilities and loves reading.",
    userName: "Demo User",
    userEmail: "demo@booknook.com",
    totalCopies: 5,
    createdAt: new Date(),
  },
  {
    title: "Wonder",
    author: "R. J. Palacio",
    category: "Kids",
    image: "https://covers.openlibrary.org/b/isbn/9780375869020-L.jpg",
    description:
      "A boy learns about kindness and acceptance.",
    userName: "Demo User",
    userEmail: "demo@booknook.com",
    totalCopies: 5,
    createdAt: new Date(),
  },
  {
    title: "Charlie and the Chocolate Factory",
    author: "Roald Dahl",
    category: "Kids",
    image: "https://covers.openlibrary.org/b/isbn/9780142410318-L.jpg",
    description:
      "A magical adventure inside a chocolate factory.",
    userName: "Demo User",
    userEmail: "demo@booknook.com",
    totalCopies: 6,
    createdAt: new Date(),
  },

  // OTHERS
  {
    title: "The Little Prince",
    author: "Antoine de Saint-Exupery",
    category: "Others",
    image: "https://covers.openlibrary.org/b/isbn/9780156012195-L.jpg",
    description:
      "A philosophical tale about friendship, love and the meaning of life.",
    userName: "Demo User",
    userEmail: "demo@booknook.com",
    totalCopies: 4,
    createdAt: new Date(),
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    category: "Others",
    image: "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg",
    description:
      "Practical ideas for building better habits.",
    userName: "Demo User",
    userEmail: "demo@booknook.com",
    totalCopies: 5,
    createdAt: new Date(),
  },
  {
    title: "Think and Grow Rich",
    author: "Napoleon Hill",
    category: "Others",
    image: "https://covers.openlibrary.org/b/isbn/9781585424337-L.jpg",
    description:
      "A classic book about success and personal goals.",
    userName: "Demo User",
    userEmail: "demo@booknook.com",
    totalCopies: 3,
    createdAt: new Date(),
  },
  {
    title: "The Power of Habit",
    author: "Charles Duhigg",
    category: "Others",
    image: "https://covers.openlibrary.org/b/isbn/9780812981605-L.jpg",
    description:
      "Explains how habits work and how they can change.",
    userName: "Demo User",
    userEmail: "demo@booknook.com",
    totalCopies: 4,
    createdAt: new Date(),
  },
];

async function seedBooks() {
  try {
    await client.connect();

    const database = client.db("Book-Nook");
    const booksCollection = database.collection("books");

    // Delete only previous sample books
    await booksCollection.deleteMany({
      userEmail: "demo@booknook.com",
    });

    // Insert 20 sample books
    const result = await booksCollection.insertMany(books);

    console.log(
      `${result.insertedCount} books inserted successfully!`
    );
  } catch (error) {
    console.error("Seed error:", error);
  } finally {
    await client.close();
  }
}

seedBooks();
