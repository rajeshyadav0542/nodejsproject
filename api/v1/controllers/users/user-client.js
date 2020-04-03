/* eslint-disable max-lines-per-function */
'use strict';

const express = require('express');
const router = express.Router();
const cors = require('cors');
const httpStatus = require('http-status-codes');
const userService = require(`${appRoot}/src/service/user`);
const { constants } = require(`${appRoot}/config/constants`);
const authHelper = require(`${appRoot}/src/helper/auth`);

router.use(cors());

class UserClient {
  async register(req, res) {
    try {
      let isValid = false;
      let userRole = 0;
      if(req.body.user_role == 'student' || req.body.user_role == 3){
        userRole = 3;
        isValid = await userService.checkEmailDomain(req.body.email, req.body.university_id);
      }else{
        userRole = 2
        isValid = true;
      }
      if(isValid){
        const user = await userService.validateUser(req.body.email);
        if (user) {
          return res.status(httpStatus.BAD_REQUEST).json({status: httpStatus.BAD_REQUEST, message: constants.USER_ALREADY_EXIST});
        }
        const password = authHelper.bcryptPassword(req.body.password);
        const userData = await userService.insertUser(req.body, password, userRole);
        const link = await authHelper.createVerificationLink(userData.id, req.body.user_role, 'register');
        const sendOTP = await sendEmail.sendVerificationLink(userData.name, userData.email, userData.id, link);
        return res.status(httpStatus.OK).json({status: httpStatus.OK, message: constants.REGISTER_SUCCESS, data:{}});
      }else{
        return res.status(httpStatus.BAD_REQUEST).json({status: httpStatus.BAD_REQUEST, message: constants.INCORRECT_EMAIL});
      }
    } catch (err) {
     return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({status: httpStatus.INTERNAL_SERVER_ERROR,message: err.message || constants.DB_ERROR});
    }
  }
}

module.exports = UserClient;
