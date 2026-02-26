/**
 * Client request type for deleting a user account.
 *
 * @category Client Requests
 * @since 1.0.0
 */
export type DeleteUserRequest = {
  /**
   * User password for verification
   */
  password: string;
};
