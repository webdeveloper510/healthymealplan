import createIndex from '../../../modules/server/create-index';
import Subscriptions from '../Subscriptions';

createIndex(Subscriptions, { status: 1, paymentMethod: 1, customerId: 1 });
