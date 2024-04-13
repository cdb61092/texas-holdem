interface User {
	id: string;
	email: string;
	displayName: string | null;
	password: string;
	currentTableId: string | null;
	currentSeatId: string | null;
	balance: number;
}

export type { User }