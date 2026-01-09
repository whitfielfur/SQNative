import type { NativeDriver } from './native-driver.ts';

export class Transaction {
  public driver: NativeDriver;
  public depth: number;

  constructor(driver: NativeDriver, depth: number) {
    this.driver = driver;
    this.depth = depth;
  }

  get isNested(): boolean {
    return this.depth > 0;
  }
  run<T>(fn: (tx: Transaction) => T): T {
    return fn(this); 
  }
}