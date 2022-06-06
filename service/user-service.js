const UserModel = require("../models/user-model")
const bcrypt = require("bcrypt")
const uuid = require('uuid')
const mailService = require('./mail-service')
const tokenService = require('./token-service')
const UserDto = require('../dtos/user-dto')
const ApiError = require('../exceptions/api-error')

class UserService{
  async registration(email, password){
    const candidate = await UserModel.findOne({email})
    if (candidate){
      throw new ApiError.BadRequest(`This user registered with this email ${email} is already available`)
    }

    const hashPassword = await bcrypt.hash(password, 3)
    const activationLink = uuid.v4()

    const user = await UserModel.create({email, password, activationLink})
    await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`)

    const userDto = new UserDto(user)
    const tokens = tokenService.generateTokens({...userDto})
    await tokenService.saveToken(userDto.id, tokens.refreshToken)

    return {...tokens, user: userDto}
  }
  async activate(activationLink){
    const user = await UserModel.findOne({activationLink})
    if (!user) throw new Error('Error link activated')

    user.isActivated = true
    await user.save()
  }


}

module.exports = new UserService()