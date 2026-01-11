import type { IDriver } from '../common/interfaces.ts';

export interface MigrationFile {
	up(db: IDriver): Promise<void> | void;
	down(db: IDriver): Promise<void> | voide
}

export interface MigrationRecord {
	id: number;
	name: string;
	applied_at: string;
}