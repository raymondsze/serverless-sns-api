import AWS from 'aws-sdk';
import response from '../utils/response';
import actionLog from '../utils/actionLog';

const sns = new AWS.SNS();

const arnKey = process.env.ARN_KEY;
const arnPrefix = process.env.ARN_PREFIX;
const arnTopic = process.env.ARN_TOPIC;

export const handler = async (event, context, callback) => {
  let cb = { code: 500, isSuccess: false };
  try {
    const body = JSON.parse(event.body);
    const { title, content, groupId } = body;
    const payload = {
      aps: { alert: content, sound: 'default' },
    };

    const message = {};
    message[arnKey] = JSON.stringify(payload);
    message.default = content;
    const snsParams = {
      MessageStructure: 'json',
      Message: JSON.stringify(message),
      TopicArn: groupId ? `${arnPrefix}${arnTopic}-${groupId}` : `${arnPrefix}${arnTopic}`,
      Subject: title,
    };
    const snsCallback = await sns.publish(snsParams).promise();
    await actionLog.createPublishAction('topic', { ...snsParams, id: groupId || 'ALL' });
    console.log(`createPlatFrom Cb: ${JSON.stringify(snsCallback)}`);
    cb = { code: 200, isSuccess: true, data: snsCallback };
  } catch (error) {
    console.log(JSON.stringify(error));
    cb = { code: 500, isSuccess: false, error };
  } finally {
    callback(null, response.cb(cb));
  }
};
