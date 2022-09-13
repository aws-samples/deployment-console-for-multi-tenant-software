# Deployment console for multi-tenant software

## Motivation

The basic idea of this solution is to turning your application into a fully automated multi-tenant platform. As you might have a team of developers, that have worked tirelessly on a solution, which every small and medium-sized company needs, but hosting it reliable, cost efficient and in different geographic regions requires a whole different expertise. 

All you want to see is a single front-end, and through a single click the infrastructure to run your application for a new customer is spun up. Then this infrastructure should not causing any trouble at all, but if it does you want to be informed about it instantly and the infrastructure to “heal itself”.


## Solution Overview

The key ingredient in this solution is automation, which we will achieve using AWS Cloud Development Kit (CDK) to describe our infrastructure-as-code. The deployment will then be triggered and parameterized through a web application run on AWS Amplify and Amazon DyanmoDB and eventually executed with AWs Lambda and AWS CodeBuild. All services run within the “management account” and are separated from the actual account running the customer applications.

For the purpose of this demonstration we have chosen the open-source software Odoo, which delivers provides a wide variety of functionality from Accounting, Inventory management, Point-of-Sales, Customer Management and others, so that many companies might potentially benefit from it. This particular software is already available in a container version and requires a PostgreSQL database for the database storage. But of course any software could be taken, containerized and scaled through AWS infrastructure and automation.

![alt text](images/architecture.png?raw=true)

### A word on Multi-tenancy

Applications used to be a single-tenant architecture (siloed model) where the application has its own infrastructure, hardware, and software ecosystem per organization. Now we could follow approach and have the entire set up copied per customer. In this case we would miss out on a few advantages, which big SaaS operators leverage on nowadays:

* reduction of infrastructure costs
* single codebase, single source of trust
* faster time-to-market and operational efficiency

Yet of course every shared resource bears the question around vulnerabilities, if my competitors running on the same infrastructure would be able to access my data.

In this solution we have separate instances for the data and app layer, but let these run serverless, so we will not over- or under-provision for any particular customer. And we share the resources, which have an hourly price tag to them and can therefore share the “fixed costs” between all customers.


## Deployment

### Prerequisites

1. AWS account(s). This solution is built to run across two accounts (optionally a single account could cater for both)
  * one management account, which will host the management portal and deployment resources 
  * one cluster account, which will host the actual running application

2. The cluster account must have a registered domain, for which a hosted zone in Amazon Route 53 is created

3. Deployment tools, which are only necessary once for the intital deployment
  * [AWS CLI Version 2](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
  * [AWS CDK Version 2](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html), initialized for management account
  * [AWS Amplify CLI](https://docs.amplify.aws/cli/start/install/) version 9 or higher
  * [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

### Deploy solution

1. Download solution from GitHub by running the following commands

```
git clone https://github.com/aws-samples/deployment-console-for-multi-tenant-software.git
cd deployment-console-for-multi-tenant-software
```

2. Navigate to the respective folder and open the file `.config` in a text editor. Please enter 
* the respective values of your AWS account numbers,
* the region in which you would like to host the management console
* the domain name which is managed 
and save the file.

3. Prepare cluster account by running the following command in the downloaded repository folder and make sure your AWS CLI user has rights to add users for this account

```
bash ./deployment/deploy-cluster-account.sh
```

4. Deploy management account by running the following command in the downloaded repository folder. You might need to change the profile of your AWS CLI beforehand, if you arre using a seperate AWS account. Amplify will use the default region configured for the logged in user.

```
bash ./deployment/deploy-management-account.sh
```

The last step will also start the admin UI locally. For security reasons, this should not be published, as you would first need to integrate the underlaying Amazon Cognito with any authentication method of your choice.

## Clean up

1. Delete all application stacks created in the cluster account in CloudFormation

2. Naviagte to repositoty folder and run (using cluster account profile of AWS CLI)
```
bash ./deployment/clean-cluster-account.sh
```

3. Delete management stack in CloudFormation

4. Run (using management account profile of AWS CLI)
```
bash ./deployment/clean-management-account.sh
```

## License Summary

This sample code is made available under the MIT-0 license. See the LICENSE file.

Whereas the frontend is based on [Northstar](https://northstar.aws-prototyping.cloud/) and therefore made available under Apache License Version 2.0.