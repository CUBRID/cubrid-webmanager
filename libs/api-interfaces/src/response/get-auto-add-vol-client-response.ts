/**
 * Client response for getautoaddvol CMS task.
 * Returns current auto-add volume configuration for a database (CMS envelope omitted).
 *
 * @category Responses
 * @since 1.0.0
 */
export type GetAutoAddVolClientResponse = {
  data: string;
  data_ext_page: string;
  data_warn_outofspace: string;
  index: string;
  index_ext_page: string;
  index_warn_outofspace: string;
};
