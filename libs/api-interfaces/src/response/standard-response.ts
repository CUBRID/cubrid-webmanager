/**
 * Standard response format for all API responses.
 * 
 * @template T - The type of data being returned
 * 
 * @category Responses
 * @since 1.0.0
 */
export type StandardResponse<T = any> = {
    data: T;
    status: number;
    note: string;
};

