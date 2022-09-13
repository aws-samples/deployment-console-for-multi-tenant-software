// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import ecs = require('aws-cdk-lib/aws-ecs');
import ec2 = require('aws-cdk-lib/aws-ec2');
import route53 = require('aws-cdk-lib/aws-route53');
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import _env from './../env';

export class OdooSharedInfraStack extends Stack {
    public readonly vpc: ec2.Vpc;
    public readonly cluster: ecs.Cluster;
    public readonly hostedzone: route53.IHostedZone;
  
    constructor(scope: Construct, id: string, props: StackProps = {}) {
      super(scope, id, props);
  
      this.vpc = new ec2.Vpc(this, 'Vpc', { maxAzs: 3 });
      this.cluster = new ecs.Cluster(this, 'Cluster', {
        vpc: this.vpc
      });

      this.hostedzone = route53.HostedZone.fromLookup(this, 'MyZone', {
        domainName: _env.domain,
      });
  
    }
  }