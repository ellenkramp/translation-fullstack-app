import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import { frontendDistPath } from "../helpers";

export interface IStaticWebsiteDeploymentProps extends cdk.StackProps {
  //   domain: string;
  //   fullUrl: string;
  // certificate
  // zone
}

export class StaticWebsiteDeployment extends Construct {
  public restApi: apigateway.RestApi;
  constructor(
    scope: Construct,
    id: string,
    props?: IStaticWebsiteDeploymentProps
  ) {
    super(scope, id);

    // bucket where website dist will reside
    const bucket = new s3.Bucket(this, "WebsiteBucket", {
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "404.html",
      publicReadAccess: true,
      blockPublicAccess: {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const distro = new cloudfront.CloudFrontWebDistribution(
      this,
      "WebsiteCloudfrontDist",
      {
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: bucket,
            },
            behaviors: [
              {
                isDefaultBehavior: true,
              },
            ],
          },
        ],
      }
    );

    // s3 construct to deploy content

    new s3deploy.BucketDeployment(this, "WebsiteDeploy", {
      destinationBucket: bucket,
      sources: [s3deploy.Source.asset(frontendDistPath)],
      distribution: distro,
      distributionPaths: ["/*"],
      // default is around 128
      memoryLimit: 512,
    });

    new cdk.CfnOutput(this, "webUrl", {
      exportName: "webUrl",
      value: `https://${distro.distributionDomainName}`,
    });
  }
}
