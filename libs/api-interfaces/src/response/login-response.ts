/**
 * Response type for login operations.
 *
 * Contains the JWT token returned after successful authentication.
 *
 * @category Responses
 * @since 1.0.0
 */
export type LoginResponse = {
    token: string;
};

/**
 * Factory function to create a login response.
 *
 * @param token - The JWT token to include in the response
 * @returns LoginResponse object containing the token
 * @category Responses
 * @since 1.0.0
 */
export function CreateLoginResponse(token: string) {
    const response: LoginResponse = {
        token: token,
    };
    return response;
}
