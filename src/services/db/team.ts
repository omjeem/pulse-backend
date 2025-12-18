import { Types } from "mongoose";
import TeamModal from "../../db/models/team";

const createNew = async (
  tenantId: Types.ObjectId,
  name: string,
  createdBy: Types.ObjectId
) => {
  return await TeamModal.create({
    tenantId,
    name,
    createdBy,
  });
};

const getAlltenantTeam = async(tenantId: Types.ObjectId)=> {
  return await TeamModal.find({
    tenantId
  })
}

const team = {
  createNew,
  getAlltenantTeam
};

export default team;
