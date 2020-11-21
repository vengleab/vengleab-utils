import nextConnect from 'next-connect';
import middleware from '../../server/middleware/dbMiddleware';
import ArticleModel from '../../server/models/article';
import Success from '../../server/responses/Success';
import BadRequest from '../../server/responses/BadRequest';

const handler = nextConnect();

handler.use(middleware).get(async (req, res) => {
  try {
    const article = await ArticleModel.findById(req.query.id);
    return new Success(res).send(article);
  } catch (error) {
    return new BadRequest(res).send(error);
  }
});

export default handler;
