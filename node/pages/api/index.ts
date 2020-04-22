import nextConnect from 'next-connect';
import middleware from '../../middleware/database';

const handler = nextConnect();

handler.use(middleware);

handler.get(async (req, res) => {
  try {
    let doc = await req.db.collection('daily').findOne()
    res.json(doc);
    console.log(doc);
    return
  } catch(e) {}

  res.json({ hellox: 'world data' })
});

export default handler;

