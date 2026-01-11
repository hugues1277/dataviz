import { useCallback, useState } from "react";

export const useHiddenKeys = (chartId?: string) => {
    const [hiddenKeys, setHiddenKeys] = useState<Record<string, boolean>>(() => {
        if (!chartId) return {};
        const stored = localStorage.getItem(`hiddenKeys_${chartId}`);
        return stored ? JSON.parse(stored) : {};
    });

    const saveHiddenKeys = useCallback((keys: Record<string, boolean>) => {
        if (!chartId) return;
        localStorage.setItem(`hiddenKeys_${chartId}`, JSON.stringify(keys));
    }, [chartId]);

    const handleLegendToggle = useCallback((key: string) => {
        setHiddenKeys((prev) => {
            const next = { ...prev, [key]: !prev[key] };
            saveHiddenKeys(next);
            return next;
        });
    }, [saveHiddenKeys, setHiddenKeys]);

    return { hiddenKeys, handleLegendToggle };
};