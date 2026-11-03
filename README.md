 BookNook – Backend API

A RESTful backend API for **BookNook**, a small online library management system. It provides book management, borrowing, returning, and user-specific book collection features using Node.js, Express.js, TypeScript, and MongoDB.

 🚀 Project Overview

BookNook Backend handles the server-side functionality of the BookNook online library application. It manages book records, tracks available copies, processes borrowing and returning operations, and protects private routes through session verification.

 🛠️ Technologies Used

- Node.js
- Express.js
- TypeScript
- MongoDB
- CORS
- dotenv
- tsx

 ✨ Key Features

- **Book Management:** Create, read, update, and delete book records.
- **Book Details:** Retrieve individual book information using its ID.
- **Borrow Books:** Allow authenticated users to borrow available books.
- **Return Books:** Process book returns and update available copies.
- **My Books:** Retrieve books added by the authenticated user.
- **Borrow History:** Retrieve borrowing records for the authenticated user.
- **Session Verification:** Protect private API routes from unauthorized access.
- **Copy Management:** Automatically update available copies when books are borrowed or returned.

 📁 Project Structure


Book-Nook-server/
│
├── src/
│   ├── config/
│   │   └── collections.ts
│   │
│   ├── middleware/
│   │   └── verifySession.ts
│   │
│   ├── routes/
│   │   ├── bookRoutes.ts
│   │   └── borrowRoutes.ts
│   │
│   ├── types/
│   │   └── express.d.ts
│   │
│   └── index.ts
│
├──  .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md


 🔗 API Endpoints

 Book Routes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/books` | Get all books |
| GET | `/books/:id` | Get a single book |
| POST | `/books` | Add a new book |
| PATCH | `/books/:id` | Update a book |
| DELETE | `/books/:id` | Delete a book |
| GET | `/my-books` | Get books added by the logged-in user |

  Borrow Routes

| Method | Endpoint | Description |
|---|---|---|
| POST | `/borrows` | Borrow a book |
| GET | `/borrows` | Get borrowing records |
| DELETE | `/borrows/:id` | Return a borrowed book |

**Note:** Private endpoints require a valid authenticated session.

 ⚙️ Installation and Setup

 1. Clone the Repository

git clone https://github.com/reduanahmed2022-reduan/Book-Nook-server.git


 2. Navigate to the Project Folder

cd Book-Nook-server


 3. Install Dependencies

npm install

 4. Configure Environment Variables

Create a `.env` file in the root directory:

PORT=5000
MONGODB_URI=your_mongodb_connection_string

Replace `your_mongodb_connection_string` with your actual MongoDB connection string.

**Important:** Never share or upload your `.env` file or database credentials to GitHub.

5. Run the Development Server

npm run dev

 6. Build the Project

npm run build

 7. Start the Production Server

npm start

🗄️ Database

- **Database Name:** `Book-Nook`
- **Collections:**
  - `books`
  - `borrows`

MongoDB is used to store book information and borrowing records.

 🌐 Server

Local development server:

http://localhost:5000


Health check endpoint:


GET /


👨‍💻 Author

**Reduan Ahmed**

GitHub: [reduanahmed2022-reduan](https://github.com/reduanahmed2022-reduan)

---

**BookNook Backend** – Powering a simple and organized online library experience.
