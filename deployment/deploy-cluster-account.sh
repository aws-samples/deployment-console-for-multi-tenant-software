# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

# check AWS CLI
CHECK="$(aws --version)"
SUB='aws-cli'
if [[ "$CHECK" == *"$SUB"* ]]; then
  echo "✓ AWS CLI installed"
else
    echo -e "\xE2\x9D\x8C AWS CLI missing"
    exit 0
fi

# read in configurations
. config

# write managment cdk config
cp ./deployment/bootstrap-policy-baseline.json ./deployment/bootstrap-policy.json
sed -i -e "s/###CLUSTERACCOUNT###/${CLUSTER_ACCOUNT}/g" ./deployment/bootstrap-policy.json

cp ./deployment/bootstrap-policy-trust-baseline.json ./deployment/bootstrap-policy-trust.json
sed -i -e "s/###MANAGEMENTACCOUNT###/${MANAGEMENT_ACCOUNT}/g" ./deployment/bootstrap-policy-trust.json

aws iam create-role --role-name CdkCrossAccountRole --assume-role-policy-document file://deployment/bootstrap-policy-trust.json
aws iam put-role-policy --role-name CdkCrossAccountRole --policy-name CdkBootstrapPolicy --policy-document file://deployment/bootstrap-policy.json

echo -e "✓ Cluster account baseline deployed"
