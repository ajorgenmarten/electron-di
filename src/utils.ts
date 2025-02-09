const COLORS = {
    BACKGROUND: {
        LIGHT: {
            BLACK: '100',
            RED: '101',
            GREEN: '102',
            YELLOW: '103',
            BLUE: '104',
            MAGENTA: '105',
            CYAN: '106',
            WHITE: '107',
            DEFAULT: '109'
        },
        DARK: {
            BLACK: '40',
            RED: '41',
            GREEN: '42',
            YELLOW: '43',
            BLUE: '44',
            MAGENTA: '45',
            CYAN: '46',
            WHITE: '47',
            DEFAULT: '49'
        }
    },
    FOREGROUND: {
        LIGHT: {
            BLACK: '90',
            RED: '91',
            GREEN: '92',
            YELLOW: '93',
            BLUE: '94',
            MAGENTA: '95',
            CYAN: '96',
            WHITE: '97',
            DEFAULT: '99'
        },
        DARK: {
            BLACK: '30',
            RED: '31',
            GREEN: '32',
            YELLOW: '33',
            BLUE: '34',
            MAGENTA: '35',
            CYAN: '36',
            WHITE: '37',
            DEFAULT: '39'
        }
    },
}

type ColorFor = keyof typeof COLORS;
type ColorType = keyof typeof COLORS[ColorFor];
type ColorValue = keyof typeof COLORS[ColorFor][ColorType];

const genTheme = (font?: { colorType: ColorType, colorValue: ColorValue }, background?: { colorType: ColorType, colorValue: ColorValue }) => {
    const theme = [
        font ? COLORS.FOREGROUND[font.colorType][font.colorValue] : undefined,
        background ? COLORS.BACKGROUND[background.colorType][background.colorValue] : undefined
    ].filter(Boolean).join(';');
    return theme ? `\x1b[${theme}]%s\x1b[0m` : `%s`;
}

const THEMES = {
    log: genTheme({colorType: 'LIGHT', colorValue: 'BLACK' }),
    success: genTheme({colorType: 'LIGHT', colorValue: 'GREEN' }),
    error: genTheme({colorType: 'LIGHT', colorValue: 'RED' }),
    info: genTheme({colorType: 'LIGHT', colorValue: 'BLUE' }),
    warn: genTheme({colorType: 'LIGHT', colorValue: 'YELLOW' }),
}

export class Logger {
    static log(message: string, title?: string) {
        console.log(`${THEMES.log}:\t${message}`, title);
    }
    static info(message: string, title?: string) {
        console.log(`${THEMES.info}:\t${message}`, title);
    }
    static success(message: string, title?: string) {
        console.log(`${THEMES.success}:\t${message}`, title);
    }
    static error(message: string, title?: string) {
        console.log(`${THEMES.error}:\t${message}`, title);
    }
    static warn(message: string, title?: string) {
        console.log(`${THEMES.warn}:\t${message}`, title);
    }
}

export class ElectronDIError extends Error {
    constructor(message: string) {
        super(`[ELECTRON DI]: \t ${message}`)
    }
}