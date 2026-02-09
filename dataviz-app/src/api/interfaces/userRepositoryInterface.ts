import ObjectRepositoryInterface from "./objectRepositoryInterface";
import { User } from "better-auth";

class UserRepositoryInterface extends ObjectRepositoryInterface<User> {
    async getCount(): Promise<number> {
        throw new Error('Not implemented');
    }
}

export default UserRepositoryInterface;