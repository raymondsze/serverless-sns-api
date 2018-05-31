# SERVERLESS-SNS-API - made with [![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)

Build a SNS service on AWS, support backend API for SNS by device, by group and by user.

Only support backend API, App development include SNS platform application & cognito is not included.

[![aws](https://camo.githubusercontent.com/4c0674ab51477ad12576d19fcc316495129d1fc9/68747470733a2f2f636d732e6167696c6974793336306170702e6e65742f77702d636f6e74656e742f75706c6f6164732f323031372f30392f656e74657270726973652d6d6f62696c652d6875625f7365727665726c6573732d636f6d707574652d6170702e706e67)

## Getting Started

1) Install serverless js

`npm install -g serverless`

2) Export AWS credit with related policy

```
export AWS_ACCESS_KEY_ID={AWS_ACCESS_KEY_ID}
export AWS_SECRET_ACCESS_KEY={AWS_SECRET_ACCESS_KEY}
```

3) copy serverless.env.yml.example to serverless.env.yml

Example:

```
dev:
  DOMAIN: <API DOMAIN>
  ARN_PREFIX: <ARN_PREFIX>
  ARN: <ARN>
  ARN_KEY: <ARN>
  ARN_TOPIC: 'sns-topic'
  AWS_ACC_ID: <AWS ACC ID>
  DYNAMODB_USER: 'SNS_DEV_USER'
  DYNAMODB_SUBSCRIBE_ACTION: 'SNS_DEV_SUBSCRIBE_ACTION'
  DYNAMODB_PUBLISH_ACTION: 'SNS_DEV_PUBLISH_ACTION'
```

| Field         | Description                                  |
| ------------- |----------------------------------------------|
| DOMAIN        | domain from AWS after deploy                 |
| ARN           | Applications ARN                             |
| ARN_PREFIX    | perfix of Applications ARN                   |
| ARN_KEY       | ARN_KEY from the Applications ARN            |
| ARN_TOPIC     | topic name for the app                       |
| AWS_ACC_ID    | aws acc id                                   |
| DYNAMODB_USER | ARN_KEY from the Applications ARN            |
| DYNAMODB_SUBSCRIBE_ACTION | action log table for subscription|
| DYNAMODB_PUBLISH_ACTION   | action log table for sns publish |

*dev* is the stage name for deployment next step, you can clone the config with different profile

Assume ARN is *arn:aws:sns:ap-southeast-1:9999999999:app/APNS_SANDBOX/APPNAME*

ARN_PREFIX is *arn:aws:sns:ap-southeast-1:9999999999:*

ARN_KEY is *APNS_SANDBOX*

AWS_ACC_ID is *9999999999*

## Deployment

`serverless deploy -s dev`

*dev* is the stage name your want

```
Service Information
service: sns
stage: uat
region: ap-southeast-1
stack: sns-uat
api keys:
  None
endpoints:
  POST - https://<domain>/<stage>/sns/subscribe
  POST - https://<domain>/<stage>/sns/unsubscribe
  POST - https://<domain>/<stage>/sns/sendByGroup
  POST - https://<domain>/<stage>/sns/sendByUser
  POST - https://<domain>/<stage>/sns/sendByDevice
functions:
  subscribe: sns-uat-subscribe
  unsubscribe: sns-uat-unsubscribe
  sendByGroup: sns-uat-sendByGroup
  sendByUser: sns-uat-sendByUser
  sendByDevice: sns-uat-sendByDevice
```

## Test

`serverless invoke test -s dev`

Successful Test result:

```
 PASS  __tests__\subscribe.test.js
  test subscribe & send with 3 types
    √ 1) unsubscribe first to clear old data (276ms)
    √ 2) subscribe (1123ms)
    √ 3) send By Group (256ms)
    √ 4) send By User (323ms)
    √ 5) send By Device (258ms)
    √ 6) unsubscribe (492ms)

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        3.557s
Ran all test suites.
```

## Room of Improvement

* Typescipt
* Auto get the api domain for testing
* cron job to delete action log table in dynamo
