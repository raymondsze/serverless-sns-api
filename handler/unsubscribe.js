import AWS from 'aws-sdk';
import Bluebird from 'bluebird';
import response from '../utils/response';
import actionLog from '../utils/actionLog';

const sns = new AWS.SNS();

const userTable = process.env.DYNAMODB_USER;
const dynamoCli = new AWS.DynamoDB.DocumentClient();

export const handler = async (event, context, callback) => {
  let cb = { code: 500, isSuccess: false };
  try {
    const body = JSON.parse(event.body);
    const { deviceId } = body;

    // 1) get data from dynamodb
    const data = await dynamoCli.query({
      TableName: userTable,
      ExpressionAttributeValues: {
        // ':id': `${groupId}_${userId}`,
        ':deviceId': deviceId,
      },
      ProjectionExpression: 'endpointArn, subscriptionArns',
      KeyConditionExpression: 'deviceId = :deviceId',
    }).promise();
    console.log(JSON.stringify(data));
    // 2) unsubscribe all
    const unsubscribeCb = await Bluebird.reduce(data.Items, async (r, item) => {
      console.log(item.endpointArn);
      console.log(item.subscriptionArns);
      console.log(item.subscriptionArns[0]);
      const unsubscribeCallback = await Bluebird.reduce(item.subscriptionArns,
        async (b, SubscriptionArn) => {
          console.log(`item.subscriptionArns: ${SubscriptionArn}`);
          const unsubscribeParams = {
            SubscriptionArn,
          };
          const unSCb = await sns.unsubscribe(unsubscribeParams).promise();
          console.log(`unSCb Cb: ${JSON.stringify(unsubscribeParams)}`);
          return [...b, unSCb];
        }, []);
      const deleteEndpointCb = await sns.deleteEndpoint(
        { EndpointArn: item.endpointArn }
      ).promise();

      await actionLog.createUnSubscribeAction({
        deviceId,
        endpointArn: item.endpointArn,
        subscriptionArns: item.subscriptionArns,
      });

      return [...r, { deleteEndpointCb, unsubscribeCallback }];
    }, []);
    // 3) delete the dynamodb record
    const deleteTableCb = await dynamoCli.delete({
      TableName: userTable,
      Key: { deviceId },
    }).promise();

    cb = { code: 200, isSuccess: true, data: { unsubscribeCb, deleteTableCb } };
  } catch (error) {
    console.log(JSON.stringify(error));
    cb = { code: 500, isSuccess: false, error };
  } finally {
    callback(null, response.cb(cb));
  }
};
