import * as cdk from '@aws-cdk/core'
import * as ec2 from '@aws-cdk/aws-ec2'
import { ApplicationLoadBalancedFargateService } from '@aws-cdk/aws-ecs-patterns'
import * as iam from '@aws-cdk/aws-iam'
import * as logs from '@aws-cdk/aws-logs'
import * as ecs from '@aws-cdk/aws-ecs'
import * as destinations from '@aws-cdk/aws-kinesisfirehose-destinations'
import * as s3 from '@aws-cdk/aws-s3'
import * as firehoses from '@aws-cdk/aws-kinesisfirehose'
import { RemovalPolicy } from '@aws-cdk/core'

export class FargateFirelensStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // Create VPC
    const vpc = new ec2.Vpc(this, 'log-sample-vpc', { maxAzs: 2});

    // kinesis firehose
    // これだと5分間バッファリングする
    const bucket = new s3.Bucket(this, 'Bucket');
    const firehose = new firehoses.DeliveryStream(this, 'Delivery Stream', {
      destinations: [new destinations.S3Bucket(bucket)],
    })

    // Create ECS Cluster
    const cluster = new ecs.Cluster(this, 'log-sample-ecs', {
      vpc,
    })

    // IAM Role
    const executionRole = new iam.Role(this, 'LogSampleEcsTaskExecutionRole', {
      roleName: 'log-sample-ecs-task-execution-role',
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchAgentServerPolicy'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
      ],
    })
    executionRole.addToPolicy(
      new iam.PolicyStatement({
        actions: [
          'firehose:PutRecord',
          'firehose:PutRecordBatch',
        ],
        resources: ['*'],
      })
    )

    const serviceTaskRole = new iam.Role(this, 'LogSampleEcsServiceTaskRole', {
      roleName: 'log-sample-ecs-service-task-role',
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    })

    // https://docs.aws.amazon.com/ja_jp/AmazonECS/latest/developerguide/task_definition_parameters.html
    const taskDef = new ecs.FargateTaskDefinition(this, "LogSampleTaskDefinition", {
      family: 'log-sample',
      memoryLimitMiB: 1024,
      cpu: 512,
      executionRole: executionRole,
      taskRole: serviceTaskRole,
    })
    const logGroup = new logs.LogGroup(this, 'LogSampleLogGroup', {
       logGroupName: '/ecs/log-sample-log',
       removalPolicy: RemovalPolicy.DESTROY // 今回は消す設定にする
    })
    const containerDef = taskDef.addContainer('LogSampleContainerDefinition',{
      image: ecs.ContainerImage.fromRegistry("springmt/log-sample:v0.0.2"),
      cpu: 256,
      memoryLimitMiB: 256,
      logging: ecs.LogDrivers.firelens({
        options: {
          Name: 'firehose',
          region: 'ap-northeast-1',
          delivery_stream: firehose.deliveryStreamName,
        }
      }),
    })
  
    containerDef.addPortMappings({
      containerPort: 8080
    })

    const service = new ApplicationLoadBalancedFargateService(this, 'LogSampleFargateService', {
      serviceName: 'log-sample-fargate-service',
      cluster,
      taskDefinition: taskDef,
      desiredCount: 1,
      maxHealthyPercent: 200,
      minHealthyPercent: 50,
    })
    
    new cdk.CfnOutput(this, "LoadBalancerDNS", {
      value: service.loadBalancer.loadBalancerDnsName
    })
  }
}
