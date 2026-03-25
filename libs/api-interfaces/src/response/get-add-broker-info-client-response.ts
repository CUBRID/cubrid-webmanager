/**
 * Client-facing response for getaddbrokerinfo CMS task.
 * Returns broker config file content (conflist) and metadata (CMS envelope omitted).
 *
 * @category Responses
 * @since 1.0.0
 */
export type GetAddBrokerInfoClientResponse = {
  /** List of config sections, each with confdata (array of config lines) */
  conflist: { confdata: string[] }[];
  /** Config name (e.g. "broker") */
  confname: string;
};
