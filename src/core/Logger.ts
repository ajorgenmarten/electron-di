// Tipos para niveles de log
type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';
type LogColor = 'reset' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan';

// Configuración del logger
interface LoggerConfig {
  showTimestamp?: boolean;
  timestampFormat?: 'local' | 'iso' | 'unix';
  minLevel?: LogLevel;
  colors?: boolean;
}

// Códigos de color ANSI
const COLORS: Record<LogLevel, LogColor> = {
  debug: 'cyan',
  info: 'green',
  warn: 'yellow',
  error: 'red',
  critical: 'magenta'
};

const COLOR_CODES: Record<LogColor, string> = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Niveles de log ordenados por importancia
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  critical: 4
};

export class Logger {
  private config: LoggerConfig = {
    showTimestamp: true,
    timestampFormat: 'local',
    minLevel: 'info',
    colors: true
  };

  constructor(config?: LoggerConfig) {
    this.config = { ...this.config, ...config };
  }

  static get Logger() {
    return new Logger({
      minLevel: 'debug', // Mostrar todos los niveles
      colors: true,      // Habilitar colores
      timestampFormat: 'local'
    });
  }

  // Función principal de logging
  private log(level: LogLevel, message: string, ...args: any[]): void {
    // Verificar nivel mínimo
    if (LOG_LEVELS[level] < LOG_LEVELS[this.config.minLevel!]) return;

    // Crear partes del mensaje
    const parts: string[] = [];

    // Agregar timestamp si está habilitado
    if (this.config.showTimestamp) {
      parts.push(this.formatTimestamp());
    }

    // Agregar nivel con color si está habilitado
    const levelStr = `[${level.toUpperCase()}]`;
    parts.push(this.config.colors 
      ? `${COLOR_CODES[COLORS[level]]}${levelStr}${COLOR_CODES.reset}` 
      : levelStr);

    // Agregar mensaje
    parts.push(message);

    // Determinar función de console
    const consoleMethod = this.getConsoleMethod(level);

    // Imprimir el mensaje
    if (args.length > 0) {
      consoleMethod(parts.join(' '), ...args);
    } else {
      consoleMethod(parts.join(' '));
    }
  }

  // Formatear timestamp según configuración
  private formatTimestamp(): string {
    const now = new Date();
    
    switch (this.config.timestampFormat) {
      case 'iso':
        return `[${now.toISOString()}]`;
      case 'unix':
        return `[${Math.floor(now.getTime() / 1000)}]`;
      case 'local':
      default:
        return `[${now.toLocaleString()}]`;
    }
  }

  // Obtener el método de console adecuado
  private getConsoleMethod(level: LogLevel): (...args: any[]) => void {
    switch (level) {
      case 'debug': return console.debug;
      case 'info': return console.info;
      case 'warn': return console.warn;
      case 'error': return console.error;
      case 'critical': return console.error;
      default: return console.log;
    }
  }

  // Métodos públicos para cada nivel
  public debug(message: string, ...args: any[]): void {
    this.log('debug', message, ...args);
  }

  public info(message: string, ...args: any[]): void {
    this.log('info', message, ...args);
  }

  public warn(message: string, ...args: any[]): void {
    this.log('warn', message, ...args);
  }

  public error(message: string, ...args: any[]): void {
    this.log('error', message, ...args);
  }

  public critical(message: string, ...args: any[]): void {
    this.log('critical', message, ...args);
  }
}