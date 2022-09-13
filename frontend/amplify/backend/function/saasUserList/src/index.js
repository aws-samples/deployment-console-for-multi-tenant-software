/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const AWS = require('aws-sdk');
const cognito = new AWS.CognitoIdentityServiceProvider();

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);

    const userPool = event["queryStringParameters"]["userpool"];

    const params = {
        //GroupName: event.groupName, 
        UserPoolId: userPool, 
    };

    var userResult = [];
      const cognitoResponse = await cognito.listUsers(params).promise();
      console.log(cognitoResponse);
      await cognitoResponse.Users.forEach(user => {
        user.Attributes.forEach(entry => {
          if(entry.Name == "email") {
            const newEntry = { id: entry.Value, email: entry.Value };
            userResult.push(newEntry);
          }
        });
      });

    console.log(userResult);

    return {
        statusCode: 200,
    //  Uncomment below to enable CORS requests
        headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Headers": "*"
          }, 
        body: JSON.stringify(userResult),
    };
};
