import { BaseCmsResponse } from '@type/cms-response/base-cms-response';
import { StartInfoCmsResponse } from '@type/cms-response/start-info-cms-response';

/**
 * Client-facing response for start info.
 * Strips CMS envelope fields from StartInfoCmsResponse.
 */
export type StartInfoClientResponse = {
    activelist: {
        active: {
            dbname: string;
        }[];
    };
    dblist: {
        dbs: {
            dbdir: string;
            dbname: string;
            isProfileExists : boolean;
        }[];
    };
};
