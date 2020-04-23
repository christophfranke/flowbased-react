import nextConnect from 'next-connect'
import middleware from '@middleware/database'
import { ObjectID } from 'mongodb'

const handler = nextConnect()
handler.use(middleware)

handler.get(async (req, res) => {
  try {
    let doc = await req.db.collection('documents').find({}).toArray()

    res.json(doc)
  } catch(e) {
    console.log(e)
    res.json({ error: "didn't work", status: 500 })
  }
})

export default handler

