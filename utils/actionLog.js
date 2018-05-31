import AWS from 'aws-sdk';
import moment from 'moment';

const dynamoCli = new AWS.DynamoDB.DocumentClient();

const publishActionTable = process.env.DYNAMODB_PUBLISH_ACTION;
const subscribeActionTable = process.env.DYNAMODB_SUBSCRIBE_ACTION;


const createPublishAction = async (action, item) => (
  new Promise(async (resolve) => {
    await dynamoCli.put({
      Item: {
        ...item,
        date: moment().valueOf(),
        dateStr: moment().add(8, 'hours').format('YYYY-MM-DD HH:mm:ss'),
        action,
      },
      TableName: publishActionTable,
    }).promise();
    resolve();
  })
);


const createSubscribeAction = async (item) => (
  new Promise(async (resolve) => {
    await dynamoCli.put({
      Item: {
        ...item,
        date: moment().valueOf(),
        dateStr: moment().add(8, 'hours').format('YYYY-MM-DD HH:mm:ss'),
        action: 'subscribe',
      },
      TableName: subscribeActionTable,
    }).promise();
    resolve();
  })
);

const createUnSubscribeAction = async (item) => (
  new Promise(async (resolve) => {
    await dynamoCli.put({
      Item: {
        ...item,
        date: moment().valueOf(),
        dateStr: moment().add(8, 'hours').format('YYYY-MM-DD HH:mm:ss'),
        action: 'unsubscribe',
      },
      TableName: subscribeActionTable,
    }).promise();
    resolve();
  })
);

export default { createPublishAction, createSubscribeAction, createUnSubscribeAction };
