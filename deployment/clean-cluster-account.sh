# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

CURRENT_PATH="$(pwd $0)"

# remove roles in cluster account
aws iam delete-role-policy --role-name CdkCrossAccountRole --policy-name CdkBootstrapPolicy
aws iam delete-role --role-name CdkCrossAccountRole
