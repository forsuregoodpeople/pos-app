import { useState } from 'react';
import { Mechanic } from '@/components/pos/MechanicModal';

export function useMechanics() {
    const [mechanics, setMechanics] = useState<Mechanic[]>([]);

    const updateMechanics = (newMechanics: Mechanic[]) => {
        setMechanics(newMechanics);
    };

    const clearMechanics = () => {
        setMechanics([]);
    };

    const getTotalPercentage = () => {
        return mechanics.reduce((total, mechanic) => total + mechanic.percentage, 0);
    };

    return {
        mechanics,
        updateMechanics,
        clearMechanics,
        getTotalPercentage,
    };
}