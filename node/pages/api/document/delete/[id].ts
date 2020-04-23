import nextConnect from 'next-connect'
import middleware from '@middleware/database'
import { ObjectID } from 'mongodb'

const handler = nextConnect()
handler.use(middleware)

handler.get(async (req, res) => {
  try {
    await req.db.collection('documents').deleteOne({
      _id: new ObjectID(req.query.id)
    })

    res.json({ ok: true })
  } catch(e) {
    console.log(e)
    res.json({ error: "didn't work", status: 500 })
  }
})

export default handler

