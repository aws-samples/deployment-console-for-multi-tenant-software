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

    const regionCode = event["queryStringParameters"]["regionCode"];
    const regionName = event["queryStringParameters"]["regionName"];

    var date = new Date();
    var epoch = date.getTime();
    var item = {
        id: regionCode,
        regionCode: regionCode,
        regionName: regionName,
        status: "Initializing",
        initialized: false,
        modified: epoch
    }
    
    // converting back to date-time
    // var initial_date = new Date(epoch);

    var params = {
        TableName: "regions",
        Item: item,
      };
    await docClient.put(params).promise();

    async function deployStack() {
        const params = {
            projectName: 'deploycdk', 
            environmentVariablesOverride: [
                {
                    name: 'type', /* required */
                    value: 'add-region', /* required */
                    type: 'PLAINTEXT'
                },
                {
                    name: 'clusterregion', /* required */
                    value: regionCode, /* required */
                    type: 'PLAINTEXT'
                },
                {
                    name: 'clusteraccount', /* required */
                    value: '283831391765', /* required */
                    type: 'PLAINTEXT'
                },
                {
                    name: 'managementaccount', /* required */
                    value: '661882677539', /* required */
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
        body: JSON.stringify('Region added'),
    };
};