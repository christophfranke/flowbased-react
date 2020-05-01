import { MongoClient } from 'mongodb'
import nextConnect from 'next-connect'


let client: MongoClient = null
function createClient() {
  const user = process.env.MONGODB_USERNAME
  const password = process.env.MONGODB_PASSWORD
  if (!user || !password) {
    throw new Error('No user or no password set for mongodb.')
  }

  client = new MongoClient(`mongodb://${user}:${password}@mongo:27017`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })  
}

async function database(req, res, next) {
  try {
    if (!client) createClient()
    if (!client.isConnected()) await client.connect()
    req.dbClient = client
    req.db = client.db('flows')

    return next()
  } catch(e) {
    res.status(500).send('Could not connect to database')
  }
}

const middleware = nextConnect()

middleware.use(database)

export default middleware