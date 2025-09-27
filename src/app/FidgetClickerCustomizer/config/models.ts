export interface ModelPosition {
    x: number;
    y: number;
    z: number;
}

export interface RotationOffset {
    x: number;
    y: number;
    z: number;
}

export interface PositionOffset {
    x: number;
    y: number;
    z: number;
}

export interface ModelConfig {
    file: string;
    rotationOffset: RotationOffset;
    scale: number;
    positionOffset: PositionOffset;
}

export interface SwitchConfig {
    name: string;
    objFile: string;
    mtlFile: string;
    folder: string;
    rotationOffset: RotationOffset;
    scale: number;
    positionOffset: PositionOffset;
}

export const MODEL_POSITIONS: Record<string, ModelPosition> = {
    housing: { x: 0, y: 0.5, z: 0 },
    switch: { x: -0.05, y: 0.15, z: 0 },
    keycap: { x: -0.05, y: 0.1, z: 0.9 }
};

export const SWITCH_TYPES: SwitchConfig[] = [
    {
        name: 'Blue Switch',
        objFile: 'mxstp.obj',
        mtlFile: 'mxstp.mtl',
        folder: 'blue_obj',
        rotationOffset: { x: 0, y: 0, z: 0 },
        scale: 0.1,
        positionOffset: { x: 0, y: 0, z: 0 }
    },
    {
        name: 'Red Switch',
        objFile: 'Cherry MX.obj',
        mtlFile: 'Cherry MX.mtl',
        folder: 'red_obj',
        rotationOffset: { x: 90, y: -6, z: 95 },
        scale: 0.088,
        positionOffset: { x: 0, y: 0, z: 0 }
    }
];

export const KEYCAP_CONFIGS: Record<string, ModelConfig> = {
    'Avengers': {
        file: 'avengers.stl',
        rotationOffset: { x: 0, y: 0, z: 90 },
        scale: 0.1,
        positionOffset: { x: 0, y: 0, z: 0 }
    },
    'Black Panther': {
        file: 'black_panther.stl',
        rotationOffset: { x: 0, y: 0, z: 90 },
        scale: 0.1,
        positionOffset: { x: 0, y: 0, z: 0 }
    },
    'Captain America': {
        file: 'captain_america.stl',
        rotationOffset: { x: 0, y: 0, z: 90 },
        scale: 0.1,
        positionOffset: { x: 0, y: 0, z: 0 }
    },
    'Hulk': {
        file: 'hulk.stl',
        rotationOffset: { x: 0, y: 0, z: 90 },
        scale: 0.1,
        positionOffset: { x: 0, y: 0, z: 0 }
    },
    'Iron Man': {
        file: 'ironman.stl',
        rotationOffset: { x: 0, y: 0, z: 90 },
        scale: 0.1,
        positionOffset: { x: 0, y: 0, z: 0 }
    }
};

export const KEYCAP_OPTIONS = Object.keys(KEYCAP_CONFIGS).map(name => ({
    name,
    file: KEYCAP_CONFIGS[name].file
}));
