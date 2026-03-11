import type { ChartConfig } from "@/src/shared/types";
import ObjectRepositoryInterface from "@/src/api/interfaces/objectRepositoryInterface";

abstract class ChartRepositoryInterface extends ObjectRepositoryInterface<ChartConfig> {
  async getByDashboard(_id: string): Promise<ChartConfig[]> {
    throw new Error("Not implemented");
  }
}

export default ChartRepositoryInterface;