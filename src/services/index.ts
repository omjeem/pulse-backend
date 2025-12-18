import jwtService from "./auth/jwt";
import team from "./db/team";
import tenant from "./db/tenant";
import user from "./db/user";
import video from "./db/video";

const services = {
  user,
  jwtService,
  tenant,
  team,
  video
};

export default services;
