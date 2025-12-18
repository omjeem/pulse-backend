import { envConfigs } from "../../config/envConfig";
import jwt, { decode, JwtPayload } from "jsonwebtoken";
import crypto from "crypto";
import { UserTokenPayload } from "../../types/types";
import { Types } from "mongoose";

type VerifyTokenSuccess = {
  valid: true;
  data: UserTokenPayload;
};

type VerifyTokenFailure = {
  valid: false;
  error: string;
};

type VerifyTokenResult = VerifyTokenSuccess | VerifyTokenFailure;

const generateJwt = async (email: string, userId: Types.ObjectId) => {
  const jwtPayload = {
    user: {
      userId,
      email,
    },
  };
  return jwt.sign(jwtPayload, envConfigs.jwt.secret, {
    expiresIn: `${envConfigs.jwt.expiresIn}d`,
  });
};

const verifyTokenAndGetPayload = (token: string): VerifyTokenResult => {
  try {
    const decoded: any = jwt.verify(token, envConfigs.jwt.secret);
    delete decoded.iat;
    delete decoded.exp;
    return { valid: true, data: decoded };
  } catch (err: any) {
    console.log("Error in verifying ", err);
    return {
      valid: false,
      error: err.message || "Token authentication failed! please login again",
    };
  }
};

const hashPassword = (password: string, email: string) => {
  const salted = password + email;
  return crypto.createHash("sha256").update(salted).digest("base64url");
};

const verifyPassword = (
  plainPassword: string,
  email: string,
  hashedPassword: string
) => {
  const newHash = hashPassword(plainPassword, email);
  console.log({ plainPassword, email, hashedPassword, newHash });
  return newHash === hashedPassword;
};

const defaultPassword = (firstName: string, email: string) => {
  return `${firstName}-${email}`;
};

const jwtService = {
  generateJwt,
  verifyTokenAndGetPayload,
  hashPassword,
  verifyPassword,
  defaultPassword,
};

export default jwtService;
