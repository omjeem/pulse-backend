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

const user = {
  createUser,
  findByEmail,
};

export default user;
