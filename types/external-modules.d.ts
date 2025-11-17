declare module 'express' {
  export interface Request {
    headers: Record<string, string | string[] | undefined>
    body?: any
  }

  export interface Response {
    status: (code: number) => Response
    send: (body?: any) => Response
    json: (body: any) => Response
  }

  export type NextFunction = (err?: any) => void
}

declare module 'typeorm' {
  export interface QueryRunner {
    query: (query: string, parameters?: any[]) => Promise<any>
  }

  export interface MigrationInterface {
    up(queryRunner: QueryRunner): Promise<void>
    down(queryRunner: QueryRunner): Promise<void>
  }
}
