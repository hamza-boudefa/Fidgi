import { useState, useEffect, useCallback, useMemo } from 'react';
import { CustomizerState } from '../types';

const INITIAL_STATE: CustomizerState = {
    housingColor: 'Yellow',
    switchType: 'Blue Switch',
    keycap: 'Avengers',
    currentStep: 'housing',
    rotation: {
        x: 0,
        y: 0,
        z: -96
    },
    emoji: ''
};

export const useCustomizerState = () => {
    const [state, setState] = useState<CustomizerState>(INITIAL_STATE);

    const updateState = useCallback((key: keyof CustomizerState, value: string) => {
        setState(prev => ({ ...prev, [key]: value }));
    }, []);

    const updateStep = useCallback((step: CustomizerState['currentStep']) => {
        setState(prev => ({ ...prev, currentStep: step }));
    }, []);

    const updateRotation = useCallback((axis: 'x' | 'y' | 'z', value: number) => {
        setState(prev => ({
            ...prev,
            rotation: { ...prev.rotation, [axis]: value }
        }));
    }, []);

    const resetRotation = useCallback(() => {
        setState(prev => ({
            ...prev,
            rotation: { x: 0, y: 0, z: 0 }
        }));
    }, []);

    const resetState = useCallback(() => {
        setState(INITIAL_STATE);
    }, []);

    // Memoized selection for manufacturing
    const manufacturingSelection = useMemo(() => ({
        housing: state.housingColor,
        switch: state.switchType,
        keycap: state.keycap,
        timestamp: new Date().toISOString()
    }), [state.housingColor, state.switchType, state.keycap]);

    // Log selections to console for manufacturing
    useEffect(() => {
        console.log('Current Selection:', manufacturingSelection);
    }, [manufacturingSelection]);

    return {
        state,
        updateState,
        updateStep,
        updateRotation,
        resetRotation,
        resetState,
        manufacturingSelection
    };
};
