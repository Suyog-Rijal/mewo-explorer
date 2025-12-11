export interface TauriResponse<T> {
    code: number;
    message: string;
    data: T | null;
}