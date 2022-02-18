import express from "express";
import express_graphql from "express-graphql";
import {
  buildSchema,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";

const author = [
  { id: 1, name: "andy", age: 22 },
  { id: 2, name: "hu", age: 22 },
  { id: 3, name: "ha", age: 22 },
  { id: 4, name: "ho", age: 22 },
  { id: 5, name: "he", age: 22 },
];

const buecher = [
  { id: 1, title: "hallo" },
  { id: 2, title: "hello" },
  { id: 3, title: "hillo" },
  { id: 4, title: "hollo" },
  { id: 5, title: "hullo" },
];

const schema = buildSchema(`
    type Author {
        id: int,
        name: string,
        age: int,
        buecher: [books]
    },
    type books {
        id: int,
        title: string
    },
    type Query {
        author(id: int!): Author,
        authors: [Author],
        book(id: int!): books
        books: [books]
    }`);

const resolvers = {
  author: ({ id }) => {
    return authors.find((author) => author.id === id);
  },
  authors: () => {
    return authors;
  },
  book: ({ id }) => {
    return books.find((book) => book.id === id);
  },
  books: () => {
    return books;
  },
};

const app = express();
app.use(
  "/graphql",
  express_graphql({ schema2, rootValue: resolvers, graphiql: true })
);
app.listen(4000, () => console.log("Runs on localhost:4000/graphql"));

//QUERIES
/*query {
  author(id: 1) {
    name,
    age
  },
  authors {
    id,
    name
  }
}*/

//ALIASES
/*query {
  leftSideAuthor: author(id: 1) {
    name,
    age
  },
  rightSideAuthor: author(id: 2) {
    name,
    age
  },
}*/

//FRAGMENTS
/*fragment authorFragment on Author {
  id,
  name
}

rightSideAuthor: author(id: 2) {
  ...authorFragment
}*/

//LAZY FETCHING
const bookType = new GraphQLObjectType({
  name: "BookType",
  description: "Alle Details vom Buch",
  fields: {
    id: { type: GraphQLInt },
    title: { type: GraphQLString },
  },
});

const authorType = new GraphQLObjectType({
  name: "AuthorType",
  description: "Alle Details vom Author",
  fields: {
    id: { type: GraphQLInt },
    name: { type: GraphQLString },
    age: { type: GraphQLInt },
    buecher: {
      type: new GraphQLList(bookType),
      resolve: (author, {}, context, info) => {
        console.log("Resolve books for author");
        return author.books.map((bookId) => books.find((a) => a.id === bookId)); //Nur wenn Books angefordert wird
      },
    },
  },
});

const queryType = new GraphQLObjectType({
  name: "QueryType",
  description: "Alle Details vom Query",
  fields: {
    author: { type: authorType },
    arguments: {
      id: { type: GraphQLInt },
    },
  },
  resolve: (parent, { id }, context, info) => {
    console.log("Resolve Author...");
    return author.find((a) => {
      a.id === id;
    });
  },
});

const schema2 = new GraphQLSchema({
  query: queryType,
  mutation: mutationType,
});

//MUTATIONS
const mutationType = new GraphQLObjectType({
  name: "Mutation Type",
  description: "Alter all needed data",
  fields: {
    createAuthor: {
      type: authorType,
      arguments: {
        name: { type: new GraphQLNonNull(GraphQLString) }, //Nicht NULL
        age: { type: GraphQLInt },
      },
      resolve: (parent, { name, age }, context, info) => {
        console.log("Create Author...");
        authors.push({
          id: authors.length,
          name,
          age,
          books: [],
        });

        return authors[authors.length - 1];
      },
    },
  },
});

/*mutation {
  createAuthor(name: "Andy", age: 22){
    name {} //Gebe Name zurück
  }
}*/
