const COLORS = {
  BACKGROUND: {
    LIGHT: {
      BLACK: "100",
      RED: "101",
      GREEN: "102",
      YELLOW: "103",
      BLUE: "104",
      MAGENTA: "105",
      CYAN: "106",
      WHITE: "107",
      DEFAULT: "109",
    },
    DARK: {
      BLACK: "40",
      RED: "41",
      GREEN: "42",
      YELLOW: "43",
      BLUE: "44",
      MAGENTA: "45",
      CYAN: "46",
      WHITE: "47",
      DEFAULT: "49",
    },
  },
  FOREGROUND: {
    LIGHT: {
      BLACK: "90",
      RED: "91",
      GREEN: "92",
      YELLOW: "93",
      BLUE: "94",
      MAGENTA: "95",
      CYAN: "96",
      WHITE: "97",
      DEFAULT: "99",
    },
    DARK: {
      BLACK: "30",
      RED: "31",
      GREEN: "32",
      YELLOW: "33",
      BLUE: "34",
      MAGENTA: "35",
      CYAN: "36",
      WHITE: "37",
      DEFAULT: "39",
    },
  },
};

type ColorFor = keyof typeof COLORS;
type ColorType = keyof (typeof COLORS)[ColorFor];
type ColorValue = keyof (typeof COLORS)[ColorFor][ColorType];
interface ThemeProps {
  font?: { colorType: ColorType; colorValue: ColorValue };
  background?: { colorType: ColorType; colorValue: ColorValue };
}
interface CustomLoggerProps {
  title: ThemeProps;
  message: ThemeProps;
}

const genTheme = ({ font, background }: ThemeProps) => {
  const theme = [
    font ? COLORS.FOREGROUND[font.colorType][font.colorValue] : undefined,
    background
      ? COLORS.BACKGROUND[background.colorType][background.colorValue]
      : undefined,
  ]
    .filter(Boolean)
    .join(";");
  return theme ? `\x1b[${theme}m[%s]\x1b[0m` : `%s`;
};

const THEMES = {
  log: genTheme({ font: { colorType: "LIGHT", colorValue: "BLACK" } }),
  success: genTheme({ font: { colorType: "LIGHT", colorValue: "GREEN" } }),
  error: genTheme({ font: { colorType: "LIGHT", colorValue: "RED" } }),
  info: genTheme({ font: { colorType: "LIGHT", colorValue: "BLUE" } }),
  warn: genTheme({ font: { colorType: "LIGHT", colorValue: "YELLOW" } }),
};

export class Logger {
  static log(message: string, title: string = "ELECTRON DI", ...args: any[]) {
    console.log(`${THEMES.log}: ${message}`, title, ...args);
  }
  static info(message: string, title: string = "ELECTRON DI", ...args: any[]) {
    console.log(`${THEMES.info}: ${message}`, title, ...args);
  }
  static success(
    message: string,
    title: string = "ELECTRON DI",
    ...args: any[]
  ) {
    console.log(`${THEMES.success}: ${message}`, title, ...args);
  }
  static error(message: string, title: string = "ELECTRON DI", ...args: any[]) {
    console.log(`${THEMES.error}: ${message}`, title, ...args);
  }
  static warn(message: string, title: string = "ELECTRON DI", ...args: any[]) {
    console.log(`${THEMES.warn}: ${message}`, title, ...args);
  }
  static customLogger(options: CustomLoggerProps) {
    const titleTheme = genTheme(options.title);
    const messageTheme = genTheme(options.message);
    return function (
      message: string,
      title: string = "LOGGER",
      ...args: any[]
    ) {
      console.log(`${titleTheme}: ${messageTheme}`, title, message, ...args);
    };
  }
}
