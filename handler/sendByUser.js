import AWS from 'aws-sdk';
import response from '../utils/response';
import Bluebird from 'bluebird';
import actionLog from '../utils/actionLog';

const sns = new AWS.SNS();
const dynamoCli = new AWS.DynamoDB.DocumentClient();

const userTable = process.env.DYNAMODB_USER;
const arnKey = process.env.ARN_KEY;

export const handler = async (event, context, callback) => {
  let cb = { code: 500, isSuccess: false };
  try {
    const body = JSON.parse(event.body);
    const { title, content, groupId, userId } = body;
    const payload = {
      aps: { alert: content, sound: 'default' },
    };
    // 1) get data from dynamodb
    const data = await dynamoCli.query({
      TableName: userTable,
      IndexName: 'myUser',
      ProjectionExpression: 'endpointArn',
      ExpressionAttributeValues: {
        ':id': `${groupId}_${userId}`,
      },
      KeyConditionExpression: 'id = :id',
    }).promise();
    console.log(JSON.stringify(data.Items));
    const publishCb = await Bluebird.reduce(data.Items, async (r, item) => {
      // 2) publish
      const message = {};
      message[arnKey] = JSON.stringify(payload);
      message.default = content;
      const snsParams = {
        MessageStructure: 'json',
        Message: JSON.stringify(message),
        TargetArn: item.endpointArn,
        Subject: title,
      };
      const snsCallback = await sns.publish(snsParams).promise();
      await actionLog.createPublishAction('user', { ...snsParams, id: `${groupId}_${userId}` });
      console.log(`createPlatFrom Cb: ${JSON.stringify(snsCallback)}`);
      return [...r, snsCallback];
    }, []);

    cb = { code: 200, isSuccess: true, data: { publishCb, items: data.Items } };
  } catch (error) {
    console.log(JSON.stringify(error));
    cb = { code: 500, isSuccess: false, error };
  } finally {
    callback(null, response.cb(cb));
  }
};
