export interface ColorOption {
    name: string;
    value: string;
}

export const HOUSING_COLORS: ColorOption[] = [
    { name: 'Yellow', value: '#FFD700' },
    { name: 'Red', value: '#FF0000' },
    { name: 'Green', value: '#00FF00' },
    { name: 'Blue', value: '#0000FF' },
    { name: 'Purple', value: '#800080' },
    { name: 'Orange', value: '#FFA500' },
    { name: 'Pink', value: '#FFC0CB' }
];

export const KEYCAP_COLORS: Record<string, string> = {
    'Avengers': '#800080',
    'Iron Man': '#FF0000',
    'Hulk': '#00FF00',
    'Captain America': '#0000FF',
    'Black Panther': '#000000',
    'default': '#FFFFFF'
};
