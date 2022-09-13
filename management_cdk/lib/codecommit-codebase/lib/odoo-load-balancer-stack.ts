// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import ec2 = require('aws-cdk-lib/aws-ec2');
import elbv2 = require('aws-cdk-lib/aws-elasticloadbalancingv2');
import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface OdooLoadBalancerStackrops extends StackProps {
    vpc: ec2.IVpc;
  }
  
  export class OdooLoadBalancerStack extends Stack {
    public readonly loadBalancer: elbv2.ApplicationLoadBalancer;
    public readonly listener: elbv2.ApplicationListener;

    constructor(scope: Construct, id: string, props: OdooLoadBalancerStackrops) {
      super(scope, id, props);
  
      this.loadBalancer = new elbv2.ApplicationLoadBalancer(this, 'LoadBalancer', {
        vpc: props.vpc,
        internetFacing: true
      });

      this.listener = new elbv2.ApplicationListener(this, 'DefaultListener', {
        loadBalancer: this.loadBalancer, // ! need to pass load balancer to attach to !
        port: 80,
      });
  
      this.listener.addAction('DefaultFixed', {
        action: elbv2.ListenerAction.fixedResponse(400, {
          contentType: "text/plain",
          messageBody: "Default route no access"
        }),
      });
  
      new CfnOutput(this, 'LoadBalancerDNS', { value: this.loadBalancer.loadBalancerDnsName, });
    }
  }