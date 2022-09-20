// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import iam = require('aws-cdk-lib/aws-iam');
import lambda = require('aws-cdk-lib/aws-lambda');
import events = require('aws-cdk-lib/aws-events');
import sqs = require('aws-cdk-lib/aws-sqs');
import codecommit = require('aws-cdk-lib/aws-codecommit');
import codebuild = require('aws-cdk-lib/aws-codebuild');
import targets = require('aws-cdk-lib/aws-events-targets');
import dynamodb = require('aws-cdk-lib/aws-dynamodb');
import { Stack, StackProps, Duration, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from 'path';
import _env from './../env';
import { BillingMode } from 'aws-cdk-lib/aws-dynamodb';

export class ManagementCdkStack extends Stack {
  
    constructor(scope: Construct, id: string, props: StackProps = {}) {
      super(scope, id, props);    

      // codeCommit
      const repository = new codecommit.Repository(this, 'ClusterCdkRepository', {
        repositoryName: 'ClusterCdkRepository',
        code: codecommit.Code.fromDirectory(path.join(__dirname, 'codecommit-codebase/'), 'main'), // optional property, branch parameter can be omitted
      });

      // codeBuild Project
      const codeBuildProject = new codebuild.Project(this, 'cdkDeploy', {
        projectName: "deploycdk",
        source: codebuild.Source.codeCommit({ repository }),
        buildSpec: codebuild.BuildSpec.fromObject({
          version: '0.2',
          phases: {
            install: {
              commands: [
                'n 14.18.3',
              ],
            },
            pre_build: {
              commands: [
                'npm install -g aws-cdk',
              ],
            },
            build: {
              commands: [
                'npm install',
                'echo "starting deployment" && codebuild-breakpoint && bash entrypoint.sh',
              ],
            },
          },
        }),
      });

      const codeBuildRights = new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['codebuild:*'],
        resources: ['arn:aws:codebuild:::*'],
      });
      const cloudwatchBuildRights = new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        resources: ['arn:aws:logs:*:*:*'],
      });
      const crossAccountBootstrapRights = new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "sts:AssumeRole"
        ],
        resources: [
          'arn:aws:iam::' + _env.clusteraccount + ':role/CdkCrossAccountRole',
          'arn:aws:iam::' + _env.clusteraccount + ':role/cdk-*'
        ],
      });

      codeBuildProject.role?.attachInlinePolicy(
        new iam.Policy(this, 'buildPolicy', {
          statements: [codeBuildRights, cloudwatchBuildRights, crossAccountBootstrapRights],
        }),
      );
      codeBuildProject.role?.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'));

      // Lambda handling Success and Error of codeBuild
      const statuslambda = new lambda.Function(this, 'StatusLambda', {
        code: lambda.Code.fromAsset(path.join(__dirname, 'status-lambda-handler')),
        handler: 'index.handler',
        runtime: lambda.Runtime.NODEJS_14_X,
      });

      // create a policy statement
      const writeDynamoDB = new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['dynamodb:UpdateItem', 'dynamodb:DeleteItem'],
        resources: ['arn:aws:dynamodb:*:*:table/regions', 'arn:aws:dynamodb:*:*:table/accounts'],
      });
      const cloudWatchBasic = new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        resources: ['arn:aws:logs:*:*:*'],
      });

      // add the policy to the Function's role
      statuslambda.role?.attachInlinePolicy(
        new iam.Policy(this, 'statusLambdaPolicy', {
          statements: [writeDynamoDB, cloudWatchBasic],
        }),
      );

      // EventBridge Rule to trigger Lambda
      const eventDetail: any = {
        "additional-information": {
          "phases": {
            "phase-type": ["COMPLETED"]
          }
        }
      }
      const rule = new events.Rule(this, 'rule', {
        eventPattern: {
          source: ["aws.codebuild"],
          detailType: ["CodeBuild Build State Change"],
          detail: eventDetail
        },
      });

      const queue = new sqs.Queue(this, 'DeadLetterQueue');

      rule.addTarget(new targets.LambdaFunction(statuslambda, {
        deadLetterQueue: queue, // Optional: add a dead letter queue
        maxEventAge: Duration.hours(2), // Optional: set the maxEventAge retry policy
        retryAttempts: 2, // Optional: set the max number of retry attempts
      }));

      // MetaData Tables
      const regionTable = new dynamodb.Table(this, 'RegionTable', {
        partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
        tableName: 'regions',
        billingMode: BillingMode.PAY_PER_REQUEST,
        removalPolicy: RemovalPolicy.DESTROY
      });

      const accountTable = new dynamodb.Table(this, 'AccountTable', {
        partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
        tableName: 'accounts',
        billingMode: BillingMode.PAY_PER_REQUEST,
        removalPolicy: RemovalPolicy.DESTROY
      });
      
    }
  }