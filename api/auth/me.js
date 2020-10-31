import nextConnect from 'next-connect';
import middleware from '../../server/middleware/dbMiddleware';
import authJWT from '../../server/middleware/authJWT';
import UserModel from '../../server/models/user';
import Success from '../../server/responses/Success';
import BadRequest from '../../server/responses/BadRequest';

const handler = nextConnect();
handler.use(middleware).use(authJWT).get(async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);
    new Success(res).send(user);
  } catch (error) {
    new BadRequest(res).send(error);
  }
});
export default handler;
