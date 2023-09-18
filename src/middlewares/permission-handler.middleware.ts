import express from 'express';
import httpStatusCodes from 'http-status-codes';

// Interfaces
import IRequest from '../interfaces/IRequest';

// Utilities
import ApiResponse from '../utilities/api-response.utility';

export const isAdmin = () => {
  console.log("si2")
  return async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    console.log("si1");
    if (req.user.email !== 'admin@gmail.com') {
      return ApiResponse.error(res, httpStatusCodes.UNAUTHORIZED);
    }
    next();
  };
};
