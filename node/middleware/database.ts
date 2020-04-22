import { MongoClient } from 'mongodb'
import nextConnect from 'next-connect'

const user = process.env.MONGODB_USERNAME
const password = process.env.MONGODB_PASSWORD
const client = new MongoClient(`mongodb://${user}:${password}@mongo:27017`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

async function database(req, res, next) {
  if (!client.isConnected()) await client.connect()
  req.dbClient = client
  req.db = client.db('flows')

  return next()
}

const middleware = nextConnect()

middleware.use(database)

export default middleware