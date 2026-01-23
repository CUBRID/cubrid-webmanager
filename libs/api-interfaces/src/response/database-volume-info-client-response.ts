/**
 * Client-facing response for database volume/space information.
 * Strips CMS envelope fields from DbSpaceInfoCmsResponse.
 *
 * @category Responses
 * @since 1.0.0
 */
export type DatabaseVolumeInfoClientResponse = {
    dbname: string;
    dbinfo: {
        free_size: string;
        purpose: string;
        total_size: string;
        type: string;
        used_size: string;
        volume_count: string;
    }[];
    fileinfo: {
        data_type: string;
        file_count: string;
        file_table_size: string;
        reserved_size: string;
        total_size: string;
        used_size: string;
    }[];
    freespace: string;
    logpagesize: string;
    pagesize: string;
    spaceinfo: {
        date?: string;
        freepage?: string;
        location: string;
        purpose?: string;
        spacename: string;
        totalpage?: string;
        type: string;
        usedpage?: string;
        volid?: string;
    }[];
};

