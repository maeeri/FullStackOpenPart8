const { ApolloServer } = require('apollo-server-express')
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core')
const mongoose = require('mongoose')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const jwt = require('jsonwebtoken')
const express = require('express')
const http = require('http')
const User = require('./models/user')
const cors = require('cors')

const { execute, subscribe } = require('graphql')
const { SubscriptionServer, handleProtocols } = require('graphql-ws')

const { WebSocketServer } = require('ws')
const { useServer } = require('graphql-ws/lib/use/ws')

const typeDefs = require('./schema')
const resolvers = require('./resolvers')

require('dotenv').config()

const JWT_SECRET = 'SECRET_CODE'
const MONGODB_URI = process.env.MONGODB_URI

console.log('connecting to MongoDb')

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB: ', error.message)
  })

const start = async () => {
  
  const app = express()
  const httpServer = http.createServer(app)

  const schema = makeExecutableSchema({ typeDefs, resolvers })

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/',
  })

  const serverCleanup = useServer({ schema }, wsServer)

  const server = new ApolloServer({
    schema,
    context: ({ req }) => {
      const auth = req.headers.authorization || ''
      if (auth && auth.toLowerCase().startsWith('bearer ')) {
        try {
          const currentUser = jwt.verify(auth.substring(7), JWT_SECRET)
          return { currentUser }
        } catch (exception) {
          
        }
      }
    },
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose()
            },
          }
        },
      },
    ],
  })

  await server.start()

  server.applyMiddleware({
    app,
    path: '/',
  })

  const PORT = 4000

  httpServer.listen(PORT, () =>
    console.log(`Server is now running on port ${PORT}`)
  )
}



start()
