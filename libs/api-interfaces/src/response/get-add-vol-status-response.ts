/**
 * Client response type for getting additional volume status.
 *
 * @category Client Responses
 * @since 1.0.0
 */
export type GetAddVolStatusResponse = {
  /**
   * Free space available
   */
  freespace: string;

  /**
   * Volume path
   */
  volpath: string;
};
