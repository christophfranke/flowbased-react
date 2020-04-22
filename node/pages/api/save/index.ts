import nextConnect from 'next-connect'
import middleware from '../../../middleware/database'

const handler = nextConnect()
handler.use(middleware)

handler.get(async (req, res) => {
  try {
    const result = await req.db.collection('documents').insertOne({
    })

    res.json({
      ok: true,
      id: result.insertedId
    })
  } catch(e) {
    console.log(e)
    res.json({ error: "didn't work" })
  }
})

export default handler

