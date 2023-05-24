const jwt = require("jsonwebtoken");

const { HttpError } = require("../helpers");

const { SECRET_KEY } = require("../config");

const { User } = require("../models/user");

const authentication = async (req, res, next) => {
  const { authorization = "" } = req.headers;
  const [bearer, token] = authorization.split(" ");
  if (bearer !== "Bearer") {
    HttpError(401, { message: "Not authorized" });
  }
  try {
    const { id } = jwt.verify(token, SECRET_KEY);
    const user = await User.findById(id);
    if (!user || !user.token || user.token !== token) {
      HttpError(401, { message: "Not authorized" });
    }
    req.user = user;
    next();
  } catch {
    next(HttpError(401, { message: "Not authorized" }));
  }
};
module.exports = authentication;
