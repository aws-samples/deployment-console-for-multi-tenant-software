#!/usr/bin/env node
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import * as cdk from 'aws-cdk-lib';
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";

import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

import { OdooCustomerStack } from '../lib/odoo-customer-stack';
import { OdooSharedInfraStack } from '../lib/odoo-infra-stack';
import { OdooLoadBalancerStack } from '../lib/odoo-load-balancer-stack';
import _env from './../env';

const ddbClient = new DynamoDBClient({ region: _env.region });
const ssmClient = new SSMClient({ region: _env.region });

const app = new cdk.App();

const getAllRegions = async () => {
  try {
    const params = {
      TableName: 'regions'
    }
    const allRegions = await ddbClient.send(new ScanCommand(params));
    return allRegions.Items;
  } catch (err) {
    console.error(err);
    return err;
  }
}

const a = async () => {
  const allRegions: any = await getAllRegions();
  allRegions.forEach(async (regionEntry: any) => {

    const env = {
      account: _env.clusteraccount, 
      region: regionEntry.regionCode.S
    }  

    // Infra Stack
    const infraStack = new OdooSharedInfraStack(app, regionEntry.regionCode.S + '-InfraStack', { env: env});

    // Load Balancer Stack
    const lbStack = new OdooLoadBalancerStack(app, regionEntry.regionCode.S + '-LbStack', {
      env: env,
      vpc: infraStack.vpc,
    });

    // Customer Stacks
    customerStacks(infraStack, lbStack, regionEntry.regionCode.S);
  });
 // app.synth();
};



const getAllAccounts = async () => {
  try {
    const params = {
      TableName: 'accounts',
    }
    const allCustomers = await ddbClient.send(new ScanCommand(params));
    return allCustomers.Items;
  } catch (err) {
    console.error(err);
    return undefined;
  }
}

/*
const getAllAccountsInRegion = async (currentRegion: string) => {
  try {
    const params = {
      TableName: 'accounts',
      FilterExpression: "contains(accountPrimaryRegion, :currentRegion)",
      ExpressionAttributeValues: {
        ":currentRegion": {S: currentRegion},
      },
    }
    const allCustomers = await ddbClient.send(new QueryCommand(params));
    return allCustomers;
  } catch (err) {
    console.error(err);
    return err;
  }
}
*/

const customerStacks = async (infra: any, lb: any, currentRegion: string) => {
  const env = {
    account: _env.clusteraccount, 
    region: currentRegion
  }

  const allCustomers: any = await getAllAccounts();
  if(allCustomers == undefined || allCustomers.Count == 0) {
    console.log("no accounts for region " + currentRegion);
  }else{
    allCustomers.forEach(async (customerEntry: any) => {
      if(customerEntry.accountPrimaryRegion.S == currentRegion) {
        const secretCommandThree = new GetParameterCommand({
          Name: customerEntry.accountCode.S + "_username",
        });
        const secretCommandFour = new GetParameterCommand({
          Name: customerEntry.accountCode.S + "_password",
        });
        new OdooCustomerStack(app, customerEntry.accountCode.S, {
          env: env,
          cluster: infra.cluster,
          vpc: infra.vpc,
          loadBalancer: lb.loadBalancer,
          listener: lb.listener,
          hostedzone: infra.hostedzone,
          cur_username: (await ssmClient.send(secretCommandThree)).Parameter?.Value,
          cur_password: (await ssmClient.send(secretCommandFour)).Parameter?.Value,
          customer_code: customerEntry.accountCode.S
        });
      }
    });
  }
}

a();


