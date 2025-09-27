export interface CustomizerState {
    emoji: any;
    housingColor: string;
    switchType: string;
    keycap: string;
    currentStep: 'housing' | 'switch' | 'keycap';
    rotation: {
        x: number;
        y: number;
        z: number;
    };
}

export interface ModelProps {
    position?: [number, number, number];
    scale?: number;
    rotation?: [number, number, number];
    color?: string;
}

export interface SwitchModelProps extends ModelProps {
    switchName: string;
}

export interface KeycapModelProps extends ModelProps {
    keycapName: string;
}

export interface HousingModelProps extends ModelProps {
    color?: string;
}
