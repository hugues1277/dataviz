import { ChartConfig } from "@/src/shared/types/types";
import ObjectRepositoryInterface from "./objectRepositoryInterface";

class ChartRepositoryInterface extends ObjectRepositoryInterface<ChartConfig> {

    async getByDashboard(id: string): Promise<ChartConfig[]> {
        throw new Error('Not implemented');
    }
}

export default ChartRepositoryInterface;