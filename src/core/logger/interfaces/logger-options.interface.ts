import { ModuleMetadata } from '@nestjs/common';

export interface LoggerModuleOptions {
  console: boolean;
  local: boolean;
}

export interface LoggerModuleAsyncOptions extends Pick<
  ModuleMetadata,
  'imports'
> {
  inject?: any[];
  useFactory: (
    ...args: any[]
  ) => Promise<LoggerModuleOptions> | LoggerModuleOptions;
}
