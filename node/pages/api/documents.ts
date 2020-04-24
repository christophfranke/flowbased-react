import nextConnect from 'next-connect'
import middleware from '@middleware/database'
import { ObjectID } from 'mongodb'

const handler = nextConnect()
handler.use(middleware)

handler.get(async (req, res) => {
  try {
    let documents = await req.db.collection('documents').find({}).toArray()

    res.json(documents.map(doc => ({
      _id: doc._id,
      name: doc.name
    })))
  } catch(e) {
    console.log(e)
    res.json({ ok: false, error: "didn't work", status: 500 })
  }
})

export default handler
