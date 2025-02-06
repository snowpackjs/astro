import fs from 'node:fs';
import path from 'node:path';
import dget from 'dlv';
import { dset } from 'dset';
import { SETTINGS_FILE } from './constants.js';

export class PreferenceStore {
	private file: string;

	constructor(
		private dir: string,
		filename = SETTINGS_FILE,
	) {
		this.file = path.join(this.dir, filename);
	}

	private _store?: Record<string, any>;
	private get store(): Record<string, any> {
		if (this._store) return this._store;
		if (fs.existsSync(this.file)) {
			try {
				this._store = JSON.parse(fs.readFileSync(this.file).toString());
			} catch {}
		}
		if (!this._store) {
			this._store = {};
			this.write();
		}
		return this._store;
	}
	private set store(value: Record<string, any>) {
		this._store = value;
		this.write();
	}
	write() {
		if (!this._store || Object.keys(this._store).length === 0) return;
		fs.mkdirSync(this.dir, { recursive: true });
		fs.writeFileSync(this.file, JSON.stringify(this.store, null, '\t'));
	}
	clear(): void {
		this.store = {};
		fs.rmSync(this.file, { recursive: true });
	}
	delete(key: string): boolean {
		dset(this.store, key, undefined);
		this.write();
		return true;
	}
	get(key: string): any {
		return dget(this.store, key);
	}
	has(key: string): boolean {
		return typeof this.get(key) !== 'undefined';
	}
	set(key: string, value: any): void {
		if (this.get(key) === value) return;
		dset(this.store, key, value);
		this.write();
	}
	getAll(): Record<string, any> {
		return this.store;
	}
}
