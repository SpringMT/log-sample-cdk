# Welcome to your CDK TypeScript project!

This is a blank project for TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template

## ハマったこと
* CloudWatchとFirehoseの権限不足でエラー
* CDKでIPアドレスがうまく解放されてなくてLimitにかかる
* CloudWachのLogGroupがデフォルトretainでdeploy -> destroy -> deployでエラー
* FargateはCPUとmemoryの組み合わせが決まっているのを知らずにやるとエラー

## AWS Firelens
sidecarに配置されるlog-router

https://github.com/aws/aws-for-fluent-bit

### awsfirelensを指定した場合
sidecarを追加するCDKの実装
https://github.com/aws/aws-cdk/blob/a04c017323130cb6f88a530e192e9e0e86fb137a/packages/%40aws-cdk/aws-ecs/lib/base/task-definition.ts#L662-L671

パーミッションとかもよしなにやってくれるのか？
https://github.com/aws/aws-cdk/blob/7966f8d48c4bff26beb22856d289f9d0c7e7081d/packages/%40aws-cdk/aws-ecs/lib/firelens-log-router.ts#L151-L177

## 参考
* https://dev.classmethod.jp/articles/ecs-deploy-using-cdk/
* https://docs.aws.amazon.com/cdk/latest/guide/about_examples.html

### CloudWatch log のtail
```
aws logs tail --follow ロググループ名
```

### S3のファイルのcat
```
aws s3 cp s3://バケット名/ファイル名 -
```
