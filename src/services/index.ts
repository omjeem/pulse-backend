import jwtService from "./auth/jwt";
import user from "./db/user";

const services = {
  user,
  jwtService
};

export default services;
