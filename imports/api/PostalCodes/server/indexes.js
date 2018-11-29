import createIndex from '../../../modules/server/create-index';
import PostalCodes from '../PostalCodes';

createIndex(PostalCodes, { title: 1, route: 1 });
