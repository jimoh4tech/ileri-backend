import { User } from "../users/users.interface";

export interface Token {
  userId: User;
  token: string;
  createdAt: Date;
}