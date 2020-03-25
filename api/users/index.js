import nextConnect from 'next-connect';
import middleware from '../../server/dbMiddleware';
import UserModel from '../../server/models/user';
import Success from '../../server/responses/Success';
import BadRequest from '../../server/responses/BadRequest';

const handler = nextConnect();

handler.use(middleware);

async function me(req, res) {
  try {
    const user = await UserModel.find({});

    if (!user) throw new Error('Not found');

    user.password = undefined;
    return new Success(res).send(user);
  } catch (error) {
    return new BadRequest(res).send(error);
  }
}

async function creatUser(req, res) {
  try {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
      return new BadRequest(res).send("You haven't input enough info");
    }

    const user = new UserModel({ username, password, email });
    return new Success(res).send(await user.save());
  } catch (error) {
    return new BadRequest(res).send(error);
  }
}

handler.get(me);
handler.post(creatUser);

export default handler;
