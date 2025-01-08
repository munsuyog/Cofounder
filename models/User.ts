// models/User.ts
import mongoose, { Model, Document } from "mongoose";
import { IUser, UserRole, UserStatus } from "@/types/User";

export interface IUserDocument extends Omit<IUser, "_id">, Document {
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.PENDING,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    whatsappCountryCode: {
      type: String,
      required: true,
    },
    whatsappNumber: {
      type: String,
      required: true,
    },
    location: String,
    bio: String,
    avatarUrl: String,
    githubId: {
      type: String,
      sparse: true,
    },
    githubData: mongoose.Schema.Types.Mixed,
    linkedinId: {
      type: String,
      sparse: true,
    },
    linkedinData: mongoose.Schema.Types.Mixed,
    skills: [String],
    experience: Number,
    companyName: String,
    industry: String,
    fundingStage: String,
    teamSize: Number,
  },
  {
    timestamps: true,
  }
);

// Add any static methods if needed
userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email });
};

const User = (mongoose.models.User ||
  mongoose.model<IUserDocument>("User", userSchema)) as Model<IUserDocument>;

export default User;
