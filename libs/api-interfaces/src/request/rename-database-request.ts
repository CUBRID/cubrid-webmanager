/**
 * Volume rename information.
 *
 * @category Client Requests
 * @since 1.0.0
 */
export type RenameInfo = {
  /**
   * Old volume path
   */
  oldPath: string;

  /**
   * New volume path
   */
  newPath: string;
};

/**
 * Client request type for renaming a database.
 *
 * @category Client Requests
 * @since 1.0.0
 */
export type RenameDatabaseRequest = {
  /**
   * New database name
   */
  rename: string;

  /**
   * Extended volume path - 'none' or path string
   */
  exvolpath: string;

  /**
   * Advanced option - 'on' or 'off'
   * When 'on', volume mapping is required
   */
  advanced: 'on' | 'off';

  /**
   * Volume mapping (only required when advanced is 'on')
   * Array of objects with old path and new path
   * Example: [{ oldPath: "/old/path", newPath: "/new/path" }, { oldPath: "/old/path2", newPath: "/new/path2" }]
   */
  volume?: RenameInfo[];

  /**
   * Force delete option - 'y' or 'n'
   */
  forcedel: 'y' | 'n';
};
