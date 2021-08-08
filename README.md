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

## 参考
* https://dev.classmethod.jp/articles/ecs-deploy-using-cdk/
* https://docs.aws.amazon.com/cdk/latest/guide/about_examples.html
