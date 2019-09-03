const mongoose = require('mongoose')
const UserModel = require('../../models/user')
const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')

module.exports.signup = async (input) => {
  const user = await UserModel.create({
    _id: new mongoose.Types.ObjectId(),
    name: input.name,
    email: input.email,
    username: input.username,
    password: await bcrypt.hash(input.password, 10)
  })

  return jsonwebtoken.sign({ _id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1d' })
}

module.exports.login = async (username, password) => {
  const user = await UserModel.findOne({ username })

  if (!user) {
    throw new Error('No user with that username')
  }

  const valid = await bcrypt.compare(password, user.password)

  if (!valid) {
    throw new Error('Incorrect password')
  }

  const token = jsonwebtoken.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  )

  return { token, user: { name: user.name, email: user.email, username: user.username } }
}

module.exports.findAll = async () => UserModel.find({})
