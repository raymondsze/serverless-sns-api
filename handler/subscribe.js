import AWS from 'aws-sdk';
import response from '../utils/response';
import actionLog from '../utils/actionLog';

const sns = new AWS.SNS();
const dynamoCli = new AWS.DynamoDB.DocumentClient();

const platformApplicationArn = process.env.ARN;
const arnTopic = process.env.ARN_TOPIC;
const userTable = process.env.DYNAMODB_USER;

const createAndSubscribeTopic = (createPlatformEndpointCb, groupId, deviceId, userId, isMain) => (
  new Promise(async (resolve) => {
    // 2) create Topic
    const createTopicCb = await sns.createTopic({
      Name: isMain ? arnTopic : `${arnTopic}-${groupId}`,
    }).promise();
    const subscribeAttribute = JSON.stringify({ deviceId: [deviceId],
      userId: [userId], groupId: [groupId] });
    console.log(`createTopicCb: ${JSON.stringify(createTopicCb)}`);
    // 3) subscribe Topic
    const subscribeCb = await sns.subscribe({
      Endpoint: createPlatformEndpointCb.EndpointArn,
      Protocol: 'application',
      TopicArn: createTopicCb.TopicArn,
    }).promise();
    console.log(`subscribeCb: ${JSON.stringify(subscribeCb)}`);
    // 4) add attrivute to subscription
    const setSubscriptionCb = await sns.setSubscriptionAttributes({
      AttributeName: 'FilterPolicy',
      AttributeValue: subscribeAttribute,
      SubscriptionArn: subscribeCb.SubscriptionArn,
    }).promise();
    console.log(`setSubscriptionCb: ${JSON.stringify(setSubscriptionCb)}`);
    resolve(subscribeCb && subscribeCb.SubscriptionArn);
  })
);

export const handler = async (event, context, callback) => {
  let cb = { code: 500, isSuccess: false };
  try {
    const body = JSON.parse(event.body);
    const { deviceId, userId, groupId, deviceToken } = body;
    // 1) create PlatformEndpoint
    const endpointCb = await sns.createPlatformEndpoint({
      PlatformApplicationArn: platformApplicationArn,
      Token: deviceToken,
      Attributes: { Enabled: 'true' },
      CustomUserData: JSON.stringify({ deviceId, userId, groupId }),
    }).promise();
    console.log(`createPlatformEndpointCb: ${JSON.stringify(endpointCb)}`);
    const subscriptionArns = [
      await createAndSubscribeTopic(endpointCb, groupId, deviceId, userId, true),
      await createAndSubscribeTopic(endpointCb, groupId, deviceId, userId, false),
    ];

    const item = {
      deviceId, id: `${groupId}_${userId}`, groupId, userId, deviceToken, subscriptionArns,
      endpointArn: endpointCb.EndpointArn,
    };
    await dynamoCli.put({
      Item: item,
      TableName: userTable,
    }).promise();
    await actionLog.createSubscribeAction(item);
    cb = { code: 200, isSuccess: true, data: item };
  } catch (error) {
    console.log(JSON.stringify(error));
    cb = { code: 500, isSuccess: false, error };
  } finally {
    callback(null, response.cb(cb));
  }
};
