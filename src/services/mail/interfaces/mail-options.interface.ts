import { ModuleMetadata } from '@nestjs/common';

export interface MailModuleOptions {
  host: string;
  port: number;
  secure: boolean;
  ignoreTls: boolean;
  user?: string;
  pass?: string;
  from: string;
  frontendUrl: string;
}

export interface MailModuleAsyncOptions extends Pick<
  ModuleMetadata,
  'imports'
> {
  inject?: any[];
  useFactory: (
    ...args: any[]
  ) => Promise<MailModuleOptions> | MailModuleOptions;
}
