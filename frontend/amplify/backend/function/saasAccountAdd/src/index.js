/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const dynamodb = require('aws-sdk/clients/dynamodb');
const AWS = require('aws-sdk');

const codebuild = new AWS.CodeBuild();
const docClient = new dynamodb.DocumentClient();
const ssm = new AWS.SSM();

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);

    const accountCode = event["queryStringParameters"]["accountCode"];
    const accountName = event["queryStringParameters"]["accountName"];
    const accountPrimaryRegion = event["queryStringParameters"]["accountPrimaryRegion"];

    async function putUserName() {
        var params = {
            Name: accountCode + "_username", /* required */
            Value: generateRandom(10), /* required */
            Overwrite: true,
            Type: "String"
        };
        const result = await ssm.putParameter(params).promise();
        return result;
    }
    await putUserName();

    async function putPassword() {
        var params = {
            Name: accountCode + "_password", /* required */
            Value: generateRandom(14), /* required */
            Overwrite: true,
            Type: "String"
        };
        const result = await ssm.putParameter(params).promise();
        return result;
    }
    await putPassword();

    async function deployStack() {
        const params = {
            projectName: 'deploycdk', 
            environmentVariablesOverride: [
                {
                    name: 'type', /* required */
                    value: 'add-account', /* required */
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

    var item = {
        id: accountCode,
        accountCode: accountCode,
        accountName: accountName,
        accountPrimaryRegion: accountPrimaryRegion,
        CurrentStatus: "Processing"
    }

    var params = {
        TableName: "accounts",
        Item: item,
      };
    await docClient.put(params).promise();

    return {
        statusCode: 200,
    //  Uncomment below to enable CORS requests
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*"
        }, 
        body: JSON.stringify('Account added'),
    };
};

function generateRandom(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
      charactersLength));
    }
    return result;
} 
