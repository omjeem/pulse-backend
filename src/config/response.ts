import { Response } from "express";
import Constants from "./constants";

export function successResponse(
  res: Response,
  message: string,
  data: any,
  status: number = Constants.STATUS_CODES.SUCCESS
) {
  return res.status(status).json({ success: true, message, data });
}

export function errorResponse(
  res: Response,
  error: any,
  status: number = Constants.STATUS_CODES.BAD_REQUEST
) {
  return res.status(status).json({ success: false, error: error });
}