import { WinstonModuleOptions } from 'nest-winston';
import { format, transports } from 'winston';

export const loggerConfig: WinstonModuleOptions = {
  transports: [
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: format.combine(
        format.timestamp(),
        format.printf(
          (info) => `${info.timestamp}|${info.level}|${info.message}`,
        ),
      ),
    }),
    new transports.File({
      filename: 'logs/info.log',
      level: 'info',
      format: format.combine(
        format.timestamp(),
        format.printf(
          (info) => `${info.timestamp}|${info.level}|${info.message}`,
        ),
      ),
    }),
    new transports.File({
      filename: 'logs/warning.log',
      level: 'warn',
      format: format.combine(
        format.timestamp(),
        format.printf(
          (info) => `${info.timestamp}|${info.level}|${info.message}`,
        ),
      ),
    }),
    new transports.File({
      filename: 'logs/combined.log',
      format: format.combine(
        format.timestamp(),
        format.printf(
          (info) => `${info.timestamp}|${info.level}|${info.message}`,
        ),
      ),
    }),
    new transports.Console({
      format: format.combine(
        format.cli(),
        format.splat(),
        format.timestamp(),
        format.printf(
          (info) => `${info.timestamp}|${info.level}|${info.message}`,
        ),
      ),
    }),
  ],
  exceptionHandlers: [new transports.File({ filename: 'logs/exceptions.log' })],
  rejectionHandlers: [new transports.File({ filename: 'logs/rejections.log' })],
};
