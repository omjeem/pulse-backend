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
          teams: [],
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

const isUserBelongToTenant = async (
  userId: Types.ObjectId,
  tenantId: Types.ObjectId
) => {
  return await MembershipModal.find({ tenantId, userId });
};

const tenant = {
  createNew,
  getAllUserTenant,
  isUserBelongToTenant,
};

export default tenant;
