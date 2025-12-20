import mongoose, { Types } from "mongoose";
import TenantModel from "../../db/models/tenant";
import MembershipModal from "../../db/models/membership";

const createNew = async (
  name: string,
  slug: string,
  metadata: any,
  userId: Types.ObjectId
) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const [tenant] = await TenantModel.create(
      [
        {
          name,
          slug,
          metadata,
        },
      ],
      { session }
    );

    const [membership] = await MembershipModal.create(
      [
        {
          userId,
          tenantId: tenant!._id,
          role: "owner",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();
    return { tenant, membership };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getAllUserTenant = async (userId: Types.ObjectId) => {
  return await MembershipModal.find({ userId }).populate({
    path: "tenantId",
    select: "_id name slug metadata createdAt",
  });
};

const getTenantMemberInfo = async (
  userId: Types.ObjectId,
  tenantId: Types.ObjectId
) => {
  return await MembershipModal.find({ tenantId, userId });
};

const addNewMembers = async (users: any) => {
  return await MembershipModal.create(users);
};

const getAllTenantMembers = async (tenantId: Types.ObjectId) => {
  return await MembershipModal.find({ tenantId }).populate({
    path: "userId",
    select : "_id name email"
  }).select("_id role status createdAt");
};

const tenant = {
  createNew,
  getAllUserTenant,
  getTenantMemberInfo,
  addNewMembers,
  getAllTenantMembers,
};

export default tenant;
