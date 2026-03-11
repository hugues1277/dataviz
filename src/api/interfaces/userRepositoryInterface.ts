import type { User } from "better-auth";
import ObjectRepositoryInterface from "@/src/api/interfaces/objectRepositoryInterface";

abstract class UserRepositoryInterface extends ObjectRepositoryInterface<User> {
  async getCount(): Promise<number> {
    throw new Error("Not implemented");
  }
}

export default UserRepositoryInterface;