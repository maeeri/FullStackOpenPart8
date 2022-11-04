import { gql } from '@apollo/client'

const BOOK_DETAILS = gql`
  fragment BookDetails on Book {
    id
    title
    published
    author {
      name
    }
    genres
  }
`

const AUTHOR_DETAILS = gql`
  fragment AuthorDetails on Author {
    id
    name
    born
    bookCount
  }
`

const All_AUTHORS = gql`
  query {
    allAuthors {
      ...AuthorDetails
    }
  }
  ${AUTHOR_DETAILS}
`

const ALL_BOOKS = gql`
  query {
    allBooks {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`

const ADD_BOOK = gql`
  mutation createBook(
    $title: String!
    $published: Int!
    $author: String!
    $genres: [String]
    $token: String!
  ) {
    addBook(
      title: $title
      published: $published
      author: $author
      genres: $genres
      token: $token
    ) {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`

const SET_BORN = gql`
  mutation editAuthor($name: String!, $setBornTo: Int!, $token: String!) {
    editAuthor(name: $name, setBornTo: $setBornTo, token: $token) {
      name
      born
    }
  }
`
const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`

const ALL_GENRES = gql`
  query {
    allGenres
  }
`

const GET_BOOKS_BY_GENRE = gql`
  query booksByGenre($genre: String!) {
    booksByGenre(genre: $genre) {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`

const GET_USER = gql`
  query me($token: String!) {
    me(token: $token) {
      username
      favouriteGenre
    }
  }
`

const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`

export {
  ADD_BOOK,
  All_AUTHORS,
  ALL_BOOKS,
  SET_BORN,
  LOGIN,
  GET_BOOKS_BY_GENRE,
  ALL_GENRES,
  GET_USER,
  BOOK_ADDED,
}
