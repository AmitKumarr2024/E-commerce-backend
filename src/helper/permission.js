import user_model from "../features/users/user_model.js";

export const uploadProductPermission = async (userId) => {
  const user = await user_model.findById(userId)
  if (user.role !== "ADMIN") {
    return false;
  }
  return true;
};
