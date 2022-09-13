#!/usr/bin/env node
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import * as cdk from 'aws-cdk-lib';
import { ManagementCdkStack } from '../lib/management_cdk-stack';
import _env from './../env';

const app = new cdk.App();

const env = {
  account: _env.account, 
  region: _env.region
}

new ManagementCdkStack(app, 'ManagementStack', { env: env});
