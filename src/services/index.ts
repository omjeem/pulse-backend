import jwtService from "./auth/jwt";
import team from "./db/team";
import tenant from "./db/tenant";
import user from "./db/user";

const services = {
  user,
  jwtService,
  tenant,
  team
};

export default services;
