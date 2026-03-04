/**
 * Client request type for deleting a database.
 *
 * @category Client Requests
 * @since 1.0.0
 */
export type DeleteDatabaseRequest = {
  /**
   * Delete backup option - 'y' to delete backup, 'n' to keep backup
   */
  delbackup: 'y' | 'n';
};
