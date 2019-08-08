import { model, Schema, Document } from 'mongoose'
import { statuses } from '@user-mgnt/utils/userUtils'

export interface IUserName {
  use: string
  family: string
  given: string[]
}

interface IIdentifier {
  system: string
  value: string
}
interface ISecurityQuestionAnswer {
  questionKey: string
  answerHash: string
}
interface ISignature {
  type: string
  data: string
}
export interface IUser {
  name: IUserName[]
  username: string
  identifiers?: IIdentifier[]
  email?: string
  mobile: string
  passwordHash: string
  salt: string
  role?: string
  type?: string
  practitionerId: string
  primaryOfficeId: string
  catchmentAreaIds: string[]
  scope: string[]
  signature: ISignature
  status: string
  deviceId?: string
  securityQuestionAnswers?: ISecurityQuestionAnswer[]
  creationDate: number
}

export interface IUserModel extends IUser, Document {}

// tslint:disable-next-line
const UserNameSchema = new Schema(
  {
    use: String,
    given: [String],
    family: String
  },
  { _id: false }
)
// tslint:disable-next-line
const IdentifierSchema = new Schema(
  {
    system: String,
    value: String
  },
  { _id: false }
)
// tslint:disable-next-line
const SecurityQuestionAnswerSchema = new Schema(
  {
    questionKey: String,
    answerHash: String
  },
  { _id: false }
)

const userSchema = new Schema({
  name: { type: [UserNameSchema], required: true },
  username: { type: String, required: true },
  identifiers: [IdentifierSchema],
  email: String,
  mobile: String,
  passwordHash: { type: String, required: true },
  salt: { type: String, required: true },
  role: String,
  type: String,
  practitionerId: { type: String, required: true },
  primaryOfficeId: { type: String, required: true },
  catchmentAreaIds: { type: [String], required: true },
  scope: { type: [String], required: true },
  status: {
    type: String,
    enum: [statuses.PENDING, statuses.ACTIVE, statuses.DISABLED],
    default: statuses.PENDING
  },
  securityQuestionAnswers: [SecurityQuestionAnswerSchema],
  deviceId: String,
  creationDate: { type: Number, default: Date.now }
})

export default model<IUserModel>('User', userSchema)
