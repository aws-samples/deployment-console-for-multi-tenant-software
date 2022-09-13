# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0
if [[ "$type" == "full-deployment" ]]
then
    echo "deploy all"
    cdk deploy --all --require-approval never
    node stackCheck.js "full-deployment"
elif [[ "$type" == 'test' ]]
then
    echo "just a test"
    echo $code
elif [[ "$type" == 'add-region' ]]
then
    echo "adding a region"
    export ACCOUNT_ID="$clusteraccount"
    role_arn="arn:aws:iam::${ACCOUNT_ID}:role/CdkCrossAccountRole"
    export AWS_DEFAULT_REGION="$clusterregion"
    KST=($(aws sts assume-role --role-arn "${role_arn}" --role-session-name cdkbootstrap --query '[Credentials.AccessKeyId,Credentials.SecretAccessKey,Credentials.SessionToken]' --output text))
    unset AWS_SECURITY_TOKEN
    export AWS_ACCESS_KEY_ID=${KST[0]}
    export AWS_SECRET_ACCESS_KEY=${KST[1]}
    export AWS_SESSION_TOKEN=${KST[2]}
    export AWS_SECURITY_TOKEN=${KST[2]}
    cd ..
    cdk bootstrap "aws://$clusteraccount/$clusterregion --trust $managementaccount --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess"
    unset AWS_ACCESS_KEY_ID
    unset AWS_SECURITY_TOKEN
    unset AWS_SESSION_TOKEN
    cd ClusterCdkRepository
    cdk deploy "$clusterregion-InfraStack" "$clusterregion-LbStack" --require-approval never

elif [[ "$type" == 'remove-region' ]]
then
    echo "removing a region"
    cdk destroy "$code-LbStack" --force
    cdk destroy "$code-InfraStack" --force
  #  node stackCheck.js "remove-region" $code
elif [[ "$type" == 'add-account' ]]
then
    echo "add account"
    cdk deploy $code --require-approval never
  #  node stackCheck.js "add-account" $code
elif [[ "$type" == 'remove-account' ]]
then
    echo "remove account"
    cdk destroy $code --force
 #   node stackCheck.js "remove-account" $code
elif [[ "$type" == 'change-account-region' ]]
then
    echo "change account region"
else
    echo "invalid parameters"
fi 