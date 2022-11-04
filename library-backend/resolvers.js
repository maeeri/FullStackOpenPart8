const { UserInputError, AuthenticationError } = require('apollo-server')
const { PubSub } = require('graphql-subscriptions')
const jwt = require('jsonwebtoken')
const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')

const { execute, subscribe } = require('graphql')
const { SubscriptionServer } = require('graphql-ws')

require('dotenv').config()

const pubsub = new PubSub()

const JWT_SECRET = 'SECRET_CODE'

const resolvers = {
  Query: {
    bookCount: async () => {
      const books = await Book.find({})
      return books.length
    },
    authorCount: async () => {
      const authors = await Author.find({})
      return authors.length
    },
    allBooks: async (root, args) => {
      let books = await Book.find({}).populate('author')

      if (args.author) {
        books = books.filter((b) => b.author.name === args.author)
      }
      if (args.genre) {
        books = books.filter((b) => b.genres.includes(args.genre))
      }

      return books
    },
    allAuthors: async () => {
      return Author.find({}).populate('books')
    },
    me: async (root, args, context) => {
      return context.currentUser
    },
    allGenres: async () => {
      const books = await Book.find({})
      const genres = []
      books.map((book) => book.genres.map((g) => genres.push(g)))
      result = [...new Set(genres)]

      return result
    },
    booksByGenre: async (root, args) => {
      const result = await Book.find({ genres: args.genre }).populate('author')
      return result
    },
  },
  Author: {
    bookCount: async (root, args) => {
      return root.books.length
    },
  },
  Mutation: {
    addBook: async (root, args) => {
      console.log(args)
      if (!jwt.verify(args.token, JWT_SECRET)) {
        throw new jwt.JsonWebTokenError(error.message)
      }

      if (args.author.length < 4 || args.title.length < 2) {
        throw new UserInputError('title or author name too short', {
          invalidArgs: args,
        })
      }

      let author = await Author.findOne({ name: args.author })

      if (!author) {
        author = new Author({ name: args.author })
        await author.save()
      }

      let book = new Book({ ...args })
      book.author = { ...author }

      try {
        await book.save()
        author.books.push(book)
        await author.save()
      } catch {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }

      pubsub.publish('BOOK_ADDED', { bookAdded: book })

      return book.populate('author')
    },
    editAuthor: async (root, args) => {
      if (!jwt.verify(args.token, JWT_SECRET)) {
        throw new jwt.JsonWebTokenError(error.message)
      }
      let author
      try {
        author = await Author.findOneAndUpdate(
          { name: args.name },
          { born: args.setBornTo },
          { new: true }
        )
        if (!author) {
          return null
        }
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
      return author
    },
    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
        favouriteGenre: args.favouriteGenre,
      })

      return user.save().catch((error) => {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== 'password') {
        throw new UserInputError(
          "wrong username or password (hint: password is 'password')"
        )
      }

      const userForToken = {
        username: user.username,
        favouriteGenre: user.favouriteGenre,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, JWT_SECRET) }
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => {
        // console.log('hiya from bookAdded subscription resolver')
        return pubsub.asyncIterator(['BOOK_ADDED'])},
    },
  },
}

module.exports = resolvers
