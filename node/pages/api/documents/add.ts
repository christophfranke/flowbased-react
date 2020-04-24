import nextConnect from 'next-connect'
import middleware from '@middleware/database'

const handler = nextConnect()
handler.use(middleware)

handler.post(async (req, res) => {
  try {
    const result = await req.db.collection('documents').insertOne({
      name: 'Unnamed',
      nodes: [],
      connections: [],
      currentId: 0,
      currentHighZ: 1
    })

    res.json({
      ok: true,
      id: result.insertedId
    })
  } catch(e) {
    console.log(e)
    res.json({ ok: false, error: "didn't work", status: 500 })
  }
})

export default handler

