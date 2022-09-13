/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const dynamodb = require('aws-sdk/clients/dynamodb');
const AWS = require('aws-sdk');
const codebuild = new AWS.CodeBuild();
const docClient = new dynamodb.DocumentClient();

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    
    const accountCode = event["queryStringParameters"]["accountCode"];

    async function deployStack() {
      const params = {
          projectName: 'deploycdk', 
          environmentVariablesOverride: [
              {
                  name: 'type', /* required */
                  value: 'remove-account', /* required */
                  type: 'PLAINTEXT'
              },
              {
                  name: 'code', /* required */
                  value: accountCode, /* required */
                  type: 'PLAINTEXT'
              }
          ]
      };

      const result = await codebuild.startBuild(params).promise();
        console.log(result);
        return result;
  }
  await deployStack();
    
    // update dynamodb to deleted
    var params = {
        ExpressionAttributeNames: {
         "#AT": "status"
        }, 
        ExpressionAttributeValues: {
         ":t": {
           S: "Deleted"
          }
        }, 
        Key: {
         "id": {
           S: accountCode
          } 
        }, 
        TableName: "accounts", 
        UpdateExpression: "SET #AT = :t"
       };
    await docClient.update(params).promise();

    return {
        statusCode: 200,
    //  Uncomment below to enable CORS requests
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*"
        }, 
        body: JSON.stringify('Account removed'),
    };
};
