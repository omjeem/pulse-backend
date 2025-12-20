import { Types } from "mongoose";
import UserModal from "../../db/models/user";

const createUser = async (name: string, email: string, password: string) => {
  return await UserModal.create({
    name,
    email,
    password,
  });
};

const findByEmail = async (email: string) => {
  return await UserModal.findOne({ email });
};

const findByUserId = async (userId: Types.ObjectId) => {
  return await UserModal.findById(userId).select("_id name email createdAt");
};

const getAllUsers = async () => {
  return await UserModal.find().select("_id name email createdAt");
};

const user = {
  createUser,
  findByEmail,
  findByUserId,
  getAllUsers,
};

export default user;
