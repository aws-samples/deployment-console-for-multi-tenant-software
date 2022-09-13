/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const dynamodb = require('aws-sdk/clients/dynamodb');
const AWS = require('aws-sdk');

const docClient = new dynamodb.DocumentClient();
const codebuild = new AWS.CodeBuild();

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);

    const regionCode = event["queryStringParameters"]["regionCode"];
    
    var params = {
        ExpressionAttributeNames: { "#status": "status" }, 
        ExpressionAttributeValues: { ":s": "Deleting" }, 
        Key: { id: regionCode }, 
        TableName: "regions", 
        UpdateExpression: "SET #status = :s"
    };
    await docClient.update(params).promise();

    async function deployStack() {
      const params = {
          projectName: 'deploycdk', 
          environmentVariablesOverride: [
              {
                  name: 'type', /* required */
                  value: 'remove-region', /* required */
                  type: 'PLAINTEXT'
              },
              {
                  name: 'code', /* required */
                  value: regionCode, /* required */
                  type: 'PLAINTEXT'
              }
          ]
      };

      const result = await codebuild.startBuild(params).promise();
        console.log(result);
        return result;
  }
  await deployStack();

    return {
        statusCode: 200,
    //  Uncomment below to enable CORS requests
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*"
        }, 
        body: JSON.stringify('region removed'),
    };
};
