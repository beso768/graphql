const { mongooseConnect } = require("./mongo/mongoConnect");
const { ApolloServer, gql } = require("apollo-server");
const { v4: uuidv4 } = require("uuid");
const Book = require("./mongo/models/bookModel");
const Author = require("./mongo/models/authorModel");

let authors = [
  {
    name: "Robert Martin",
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: "Martin Fowler",
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963,
  },
  {
    name: "Fyodor Dostoevsky",
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821,
  },
  {
    name: "Joshua Kerievsky", // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  {
    name: "Sandi Metz", // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
];

let books = [
  {
    title: "Clean Code",
    published: 2008,
    author: "Robert Martin",
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring"],
  },
  {
    title: "Agile software development",
    published: 2002,
    author: "Robert Martin",
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ["agile", "patterns", "design"],
  },
  {
    title: "Refactoring, edition 2",
    published: 2018,
    author: "Martin Fowler",
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring"],
  },
  {
    title: "Refactoring to patterns",
    published: 2008,
    author: "Joshua Kerievsky",
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring", "patterns"],
  },
  {
    title: "Practical Object-Oriented Design, An Agile Primer Using Ruby",
    published: 2012,
    author: "Sandi Metz",
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring", "design"],
  },
  {
    title: "Crime and punishment",
    published: 1866,
    author: "Fyodor Dostoevsky",
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ["classic", "crime"],
  },
  {
    title: "The Demon ",
    published: 1872,
    author: "Fyodor Dostoevsky",
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ["classic", "revolution"],
  },
];

const typeDefs = gql`
  type Book {
    title: String
    published: Int
    author: String
    genres: [String]
    id: String
  }

  type Authors {
    name: String
    born: Int
    id: ID
    bookCount: Int
  }
  type Query {
    bookCount: Int
    authorCount: Int
    allBooks(author: String, genre: String): [Book]
    allAuthors: [Authors]
    findBook(title: String): Book
    authors: Authors
  }

  type Mutation {
    addAuthor(name: String!, born: Int!): Authors
    addBook(
      title: String
      published: Int
      author: String
      genres: [String]
    ): Book
    addBorn(name: String!, born: Int!): Authors
  }
`;
const resolvers = {
  Query: {
    bookCount: () => authors.length,
    authors: () => authors,
    allBooks: (_, { author = "", genre = "" }) => {
      if (author || genre) {
        return Book.find({ $or: [{ author: author }, { genres: genre }] });
      }
      return Book.find({});
    },
    allAuthors: async () => {
      const authors = await Author.find({});
      console.log(authors);
      const count = authors.map(async (author) => {
        console.log(author.name);
        const books = await Book.find({ author: author.name });
        // console.log(books);
        return {
          ...author._doc,
          bookCount: books.lenght,
        };
      });
      return count;
    },
    findBook: async (root, { title }) => {
      let test = await Book.findOne({ title: title });
      return test;
    },
  },
  Mutation: {
    addBook: async (root, args) => {
      const book = new Book({ ...args });
      try {
        await book.save();
      } catch (err) {
        console.log(err);
      }
      return book;
    },
    addAuthor: async (root, args) => {
      const author = new Author({ ...args });
      try {
        await author.save();
      } catch (err) {
        console.log(err);
      }
      return author;
    },
    addBorn: async (_, { name, born }) => {
      const author = await Author.find({ name }, (err, data) => data);
      if (author) {
        try {
          let updated = await Author.findOneAndUpdate(
            { name },
            { born },
            { new: true }
          );
          return await updated;
        } catch (err) {
          console.log(err);
        }
      }
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
