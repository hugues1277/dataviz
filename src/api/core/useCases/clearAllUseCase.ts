import { chartRepository } from "../../repositories/chartRepository";
import { connectionRepository } from "../../repositories/connectionRepository";
import { dashboardRepository } from "../../repositories/dashboardRepository";

const clearAllUseCase = {
    execute: async () => {
        await connectionRepository.clearAll();
        await dashboardRepository.clearAll();
        await chartRepository.clearAll();
    },
};

export default clearAllUseCase;