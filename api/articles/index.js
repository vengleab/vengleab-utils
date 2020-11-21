import nextConnect from 'next-connect';
import middleware from '../../server/middleware/dbMiddleware';
import ArticleModel from '../../server/models/article';
import Success from '../../server/responses/Success';
import BadRequest from '../../server/responses/BadRequest';

const handler = nextConnect();

handler.use(middleware);

async function articles(req, res) {
  try {
    const article = await ArticleModel.find({});
    return new Success(res).send(article);
  } catch (error) {
    return new BadRequest(res).send(error);
  }
}

async function creatArticle(req, res) {
  try {
    const { title, imageUrl, description } = req.body;
    if (!title || !imageUrl || !description) {
      return new BadRequest(res).send("You haven't input enough info");
    }

    const article = new ArticleModel({ title, imageUrl, description });
    return new Success(res).send(await article.save());
  } catch (error) {
    return new BadRequest(res).send(error);
  }
}

handler.get(articles);
handler.post(creatArticle);

export default handler;
