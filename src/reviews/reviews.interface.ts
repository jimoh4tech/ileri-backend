import { User } from "../users/users.interface";

export interface Review {
  id: string;
  user: User;
  comment: string;
  rating: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type NewReview = Omit<Review, 'id'>;
export type Reviews = Review[];

