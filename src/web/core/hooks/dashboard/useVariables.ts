import { DashboardVariable } from '../../../../shared/types/types';
import { getDefaultVariableValues, resolveVariableValue } from '../../utils/variableUtils';
import { useState, useCallback } from 'react';
import { saveDashboardVariablesUseCase } from '../../useCases/dashboards/saveDashboardVariablesUseCase';

interface VariablesResult {
    // Variables du dashboard actif uniquement
    variables: DashboardVariable[];
    // Valeurs des variables du dashboard actif uniquement
    variableValues: Record<string, string>;

    initializeVariables: (variables: DashboardVariable[]) => void;
    // Méthodes pour gérer les variables (utilise le dashboard actif du dashboardsStore)
    addVariable: (variable: DashboardVariable) => Promise<void>;
    updateVariable: (variable: DashboardVariable) => Promise<void>;
    deleteVariable: (variableId: string) => Promise<void>;

    // Méthodes pour gérer les valeurs des variables (utilise le dashboard actif du dashboardsStore)
    setVariableValue: (name: string, value: string) => void;
    setVariableValues: (values: Record<string, string>) => void;
    resetVariableValues: () => void;
}

export const useVariables = (initialVariables?: DashboardVariable[], initialVariableValues?: Record<string, string>): VariablesResult => {
    const [variables, setVariables] = useState<DashboardVariable[]>(initialVariables ?? []);
    const [variableValues, setVariableValues] = useState<Record<string, string>>(initialVariableValues ?? getDefaultVariableValues(initialVariables ?? []));

    const initializeVariables = useCallback((initialVariables: DashboardVariable[]) => {
        setVariables(initialVariables);
        setVariableValues(getDefaultVariableValues(initialVariables));
    }, [setVariables, setVariableValues]);

    const addVariable = useCallback(async (variable: DashboardVariable) => {
        const newVariables = [...variables, variable];
        setVariables(newVariables);
        setVariableValues({ ...variableValues, [variable.name]: resolveVariableValue(variable) });

        saveDashboardVariablesUseCase.execute(newVariables);
    }, [variables, variableValues]);

    const updateVariable = useCallback(async (variable: DashboardVariable) => {
        const newVariables = variables.map(v => v.id === variable.id ? variable : v);
        setVariables(newVariables);
        setVariableValues(prev => ({ ...prev, [variable.name]: variable.defaultValue }));

        saveDashboardVariablesUseCase.execute(newVariables);
    }, [variables, variableValues]);

    const deleteVariable = useCallback(async (variableId: string) => {
        const newVariables = variables.filter(v => v.id !== variableId);
        setVariables(newVariables);
        setVariableValues(prev => ({ ...prev, [variableId]: "" }));

        saveDashboardVariablesUseCase.execute(newVariables);
    }, [variables, variableValues]);

    const setVariableValue = useCallback((name: string, value: string) => {
        setVariableValues(prev => ({ ...prev, [name]: value }));
    }, []);

    const resetVariableValues = useCallback(() => {
        setVariableValues(getDefaultVariableValues(variables));
    }, [variables]);

    return {
        variables,
        variableValues,
        initializeVariables,
        addVariable,
        updateVariable,
        deleteVariable,
        setVariableValue,
        setVariableValues,
        resetVariableValues,
    };
}
