import nextConnect from 'next-connect'
import middleware from '@middleware/database'
import { ObjectID } from 'mongodb'

const handler = nextConnect()
handler.use(middleware)

handler.get(async (req, res) => {
  try {
    let doc = await req.db.collection('documents').findOne({
      _id: new ObjectID(req.query.id)
    })

    res.json(doc)
  } catch(e) {
    console.log(e)
    res.json({ error: "didn't work" })
  }
})

export default handler

