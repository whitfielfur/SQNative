import type { NativeDriver } from '../driver/native-driver.ts';

export abstract class BaseBuilder {
	protected driver: NativeDriver;
	protected params: unknown[] = [];

	constructor(driver: NativeDriver) {
		this.driver = driver;
	}

	protected addParam(value: unknown): void {
		this.params.push(value);
	}

	protected abstract toSQL(): { sql: string; params: unkown[] };
}