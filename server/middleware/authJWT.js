import JWTUtils from '../../utils/JWTUtils';
import BadRequest from '../responses/BadRequest';
import UnauthorizedAccess from '../responses/UnauthorizedAccess';

export default (req, res, next) => {
  const { authorization } = req.headers;
  const [authType, token] = authorization ? authorization.split(' ') : [];

  if (authType === 'Bearer' && token) {
    try {
      const userId = JWTUtils.extractPayload(token);
      req.userId = userId;
      next();
      return;
    } catch (error) {
      new BadRequest(res).send(error);
    }
  }
  new UnauthorizedAccess(res).send();
};
