// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import ecs = require('aws-cdk-lib/aws-ecs');
import ec2 = require('aws-cdk-lib/aws-ec2');
import elbv2 = require('aws-cdk-lib/aws-elasticloadbalancingv2');
import route53 = require('aws-cdk-lib/aws-route53');
import targets = require('aws-cdk-lib/aws-route53-targets');
import * as rds from 'aws-cdk-lib/aws-rds';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Stack, StackProps, SecretValue, CfnOutput, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import _env from './../env';

export interface OdooCustomerStackProps extends StackProps {
    vpc: ec2.IVpc;
    cluster: ecs.ICluster;
    loadBalancer: elbv2.IApplicationLoadBalancer;
    listener: elbv2.IApplicationListener;
    hostedzone: route53.IHostedZone;
    customer_code: string;
    cur_username: string | undefined;
    cur_password: string | undefined;
}
  
  export class OdooCustomerStack extends Stack {
    public readonly rdsCluster: rds.DatabaseCluster;

    constructor(scope: Construct, id: string, props: OdooCustomerStackProps) {
      super(scope, id, props);

      // without username or password we dont need to start for this customer
      if(props.cur_username !== undefined && props.cur_password !== undefined) {

        const dbSg = new ec2.SecurityGroup(this, props.customer_code + 'db-sg', {
          vpc: props.vpc,
          allowAllOutbound: true,
          description: 'security group for DB',
        });  

        if(props.cur_username !== undefined && props.cur_password !== undefined) {
          const auroraEngine = rds.DatabaseClusterEngine.auroraPostgres({
            version: rds.AuroraPostgresEngineVersion.VER_13_6,
          });

          this.rdsCluster = new rds.DatabaseCluster(this, props.customer_code + 'AuroraDatabase', {
            engine: auroraEngine,
            credentials: { 
              username: props.cur_username.toString(),
              password: SecretValue.unsafePlainText(props.cur_password)
            },
            instances: 2,
            storageEncrypted: false,
            deletionProtection: false,
            copyTagsToSnapshot: true,
            //subnetGroup: subnetGroup,
            defaultDatabaseName: "postgres",
            cloudwatchLogsRetention: logs.RetentionDays.FIVE_DAYS,
            instanceProps: {
              vpc: props.vpc,
              securityGroups: [dbSg],
            },
          });
        }
      
        // Standard ECS service setup
        const logging = new ecs.AwsLogDriver({
          streamPrefix: props.customer_code + 'log',
          logRetention: logs.RetentionDays.FIVE_DAYS
        })

        const taskDefinition = new ecs.FargateTaskDefinition(this, props.customer_code + 'TaskDef', {
          memoryLimitMiB: 1024,
          cpu: 512
        });
        const container = taskDefinition.addContainer(props.customer_code + 'web', {
          //image: ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample"),
          image: ecs.ContainerImage.fromRegistry("odoo"),
          memoryLimitMiB: 1024,
          cpu: 512,
          environment: {
            HOST: this.rdsCluster.clusterEndpoint.hostname,
            PORT: "5432",
            USER: props.cur_username,
            PASSWORD: props.cur_password
          },
          logging: logging
        });
    
        container.addPortMappings({
          containerPort: 8069,
          //containerPort: 80,
          protocol: ecs.Protocol.TCP
        });
    
        const service = new ecs.FargateService(this, props.customer_code + "Service", {
          cluster: props.cluster,
          taskDefinition
        });
    
        // Create a new listener in the current scope, add targets to it
     //   const listener = new elbv2.ApplicationListener(this, props.customer_code + 'Listener', {
     //     loadBalancer: props.loadBalancer, // ! need to pass load balancer to attach to !
     //     port: 80,
     //   });

        const subdomain = new route53.ARecord(this, props.customer_code + 'alias', {
          zone: props.hostedzone,
          recordName: props.customer_code,
          target: route53.RecordTarget.fromAlias(new targets.LoadBalancerTarget(props.loadBalancer)),
          ttl: Duration.minutes(5)
        });
    
        props.listener.addTargets(props.customer_code + 'ECS', {
          priority: 10,
          conditions: [
            elbv2.ListenerCondition.hostHeaders([props.customer_code + '.' + _env.domain]),
          //  elbv2.ListenerCondition.pathPatterns(['/' + props.customer_code])
          ],
          healthCheck: {
            healthyHttpCodes: "200,303"
          },
          //port: 80,
          port: 8086,
          protocol: elbv2.ApplicationProtocol.HTTP,
          targets: [service],
        });

        dbSg.connections.allowFrom(
          new ec2.Connections({
            securityGroups: [service.connections.securityGroups[0]],
          }),
          ec2.Port.tcp(5432)
        )

        new CfnOutput(this, 'LoadBalancerDNS', { value: props.loadBalancer.loadBalancerDnsName});
        new CfnOutput(this, 'CustomerARecord', { value: props.customer_code + _env.domain});
      }

      // still need an output for the current DNS to the service

    }
  }