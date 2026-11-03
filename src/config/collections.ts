import { Collection, Document } from "mongodb";

export let booksCollection: Collection<Document>;
export let borrowsCollection: Collection<Document>;

export const setBooksCollection = (
  collection: Collection<Document>
) => {
  booksCollection = collection;
};

export const setBorrowsCollection = (
  collection: Collection<Document>
) => {
  borrowsCollection = collection;
};