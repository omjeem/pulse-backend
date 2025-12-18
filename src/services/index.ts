import jwtService from "./auth/jwt";
import tenant from "./db/tenant";
import user from "./db/user";

const services = {
  user,
  jwtService,
  tenant
};

export default services;
