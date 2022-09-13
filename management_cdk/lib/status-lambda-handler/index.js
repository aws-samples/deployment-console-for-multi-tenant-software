// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const dynamodb = require('aws-sdk/clients/dynamodb');

const docClient = new dynamodb.DocumentClient();

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);

    const status = event.detail["build-status"];
    // FAILED or SUCCEEDED

    const env_variables = event.detail["additional-information"].environment["environment-variables"];
    var operation = "unknown";
    var code = "unknown";
    env_variables.forEach(env_variable => {
        if(env_variable.name == "type") {
            // add-account, remove-account, add-region, remove-region
            operation = env_variable.value;
        }

        if(env_variable.name == "code") {
            code = env_variable.value;
        }
        if(env_variable.name == "clusterregion") {
            code = env_variable.value;
        }       
    });
    
    if(operation == "add-account") {
        if(status == "SUCCEEDED") {
            var params = {
                ExpressionAttributeNames: { "#status": "CurrentStatus" }, 
                ExpressionAttributeValues: { ":s": "Online" }, 
                Key: { id: code }, 
                TableName: "accounts", 
                UpdateExpression: "SET #status = :s"
            };
            await docClient.update(params).promise();
        }else{
            var params = {
                ExpressionAttributeNames: { "#status": "CurrentStatus" }, 
                ExpressionAttributeValues: { ":s": "Creation Failed" }, 
                Key: { id: code }, 
                TableName: "accounts", 
                UpdateExpression: "SET #status = :s"
            };
            await docClient.update(params).promise();
        }
    }else if(operation == "remove-account") {
        if(status == "SUCCEEDED") {
            var params = {
                TableName: "accounts",
                Key: { id: code } 
            };
            await docClient.delete(params).promise();
        }else{
            var params = {
                ExpressionAttributeNames: { "#status": "CurrentStatus" }, 
                ExpressionAttributeValues: { ":s": "Deletion Failed" }, 
                Key: { id: code }, 
                TableName: "accounts", 
                UpdateExpression: "SET #status = :s"
            };
            await docClient.update(params).promise();
        }
    }else if (operation == "add-region") {
        if(status == "SUCCEEDED") {
            var params = {
                ExpressionAttributeNames: { "#status": "status" }, 
                ExpressionAttributeValues: { ":s": "Ready" }, 
                Key: { id: code }, 
                TableName: "regions", 
                UpdateExpression: "SET #status = :s"
            };
            await docClient.update(params).promise();
        }else{
            var params = {
                ExpressionAttributeNames: { "#status": "status" }, 
                ExpressionAttributeValues: { ":s": "Creation Failed" }, 
                Key: { id: code }, 
                TableName: "regions", 
                UpdateExpression: "SET #status = :s"
            };
            await docClient.update(params).promise();
        }
    }else if (operation == "remove-region") {
        if(status == "SUCCEEDED") {
            var params = {
                TableName: "regions",
                Key: { id: code } 
            };
            await docClient.delete(params).promise();
        }else{
            var params = {
                ExpressionAttributeNames: { "#status": "status" }, 
                ExpressionAttributeValues: { ":s": "Deletion Failed" }, 
                Key: { id: code }, 
                TableName: "regions", 
                UpdateExpression: "SET #status = :s"
            };
            await docClient.update(params).promise();
        }
    }

    return {
        statusCode: 200,
    //  Uncomment below to enable CORS requests
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*"
        }, 
        body: JSON.stringify('Status updated'),
    };
};