import nextConnect from 'next-connect';
import middleware from '../../server/middleware/dbMiddleware';
import UserModel from '../../server/models/user';
import Success from '../../server/responses/Success';
import BadRequest from '../../server/responses/BadRequest';
import UnauthorizedAccess from '../../server/responses/UnauthorizedAccess';
import JWTUtils from '../../utils/JWTUtils';

const bcrypt = require('bcrypt');

const handler = nextConnect();

handler.use(middleware).post(async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email && password) {
      const user = await UserModel.findOne({ email });
      if (user && bcrypt.compareSync(password, user.password)) {
        return new Success(res).send({
          token: JWTUtils.sign(user._id),
        });
      }
      return new UnauthorizedAccess(res).send();
    }
    return new UnauthorizedAccess(res).send();
  } catch (error) {
    return new BadRequest(res).send(error);
  }
});

export default handler;
