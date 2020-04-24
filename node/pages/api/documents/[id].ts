import nextConnect from 'next-connect'
import middleware from '@middleware/database'
import { ObjectID } from 'mongodb'

const handler = nextConnect()
handler.use(middleware)

handler.get(async (req, res) => {
  let id
  try {
    id = new ObjectID(req.query.id)
    try {
      let doc = await req.db.collection('documents').findOne({
        _id: id
      })

      if (doc) {
        res.json(doc)
      } else {
        res.json({ ok: false, error: 'not found', status: 404 })
      }
    } catch(e) {
      console.log(e)
      res.json({ ok: false, error: "didn't work", status: 500 })
    }
  } catch(e) {
    res.json({ ok: false, error: 'not found', status: 404 })
  }
})

handler.delete(async (req, res) => {
  try {
    await req.db.collection('documents').deleteOne({
      _id: new ObjectID(req.query.id)
    })

    res.json({ ok: true })
  } catch(e) {
    console.log(e)
    res.json({ ok: false, error: "didn't work", status: 500 })
  }
})

handler.post(async (req, res) => {
  try {
    await req.db.collection('documents').updateOne({
      _id: new ObjectID(req.query.id)
    }, {
      $set: {
        data: Math.random()
      }
    })

    res.json({ ok: true })
  } catch(e) {
    console.log(e)
    res.json({ ok: false, error: "didn't work", status: 500 })
  }
})

export default handler

