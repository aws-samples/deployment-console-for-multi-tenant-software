# check AWS CLI
CHECK="$(aws --version)"
SUB='aws-cli'
if [[ "$CHECK" == *"$SUB"* ]]; then
  echo "✓ AWS CLI installed"
else
    echo -e "\xE2\x9D\x8C AWS CLI missing"
    exit 0
fi

# check CDK
CHECK="$(cdk --version)"
SUB='2.3'
if [[ "$CHECK" == *"$SUB"* ]]; then
  echo "✓ AWS CDK v2 installed"
else
    echo -e "\xE2\x9D\x8C AWS CDK v2 missing"
    exit 0
fi

# check Amplify
CHECK="$(amplify --version)"
SUB='9.'
if [[ "$CHECK" == *"$SUB"* ]]; then
  echo -e "✓ Amplify installed"
else
    echo -e "\xE2\x9D\x8C Amplify missing or out-dated"
    exit 0
fi

FILE=./config
if test -f "$FILE"; then
    echo "✓ config file exists"
else
    echo -e "\xE2\x9D\x8C Config file missing"
    exit 0
fi

CURRENT_PATH="$(pwd $0)"

# read in configurations
. config

{
  # write managment cdk config
  cp ./management_cdk/env_blank.ts ./management_cdk/env.ts
  sed -i -e "s/###ACCOUNT###/${MANAGEMENT_ACCOUNT}/g" ./management_cdk/env.ts
  sed -i -e "s/###REGION###/${MANAGEMENT_REGION}/g" ./management_cdk/env.ts
  sed -i -e "s/###CLUSTERACCOUNT###/${CLUSTER_ACCOUNT}/g" ./management_cdk/env.ts
  sed -i -e "s/###DOMAIN###/${DOMAIN_NAME}/g" ./management_cdk/env.ts

  rm ./frontend/amplify/backend/function/saasRegionAdd/src/index.js
  cp ./frontend/amplify/backend/function/saasRegionAdd/src/index-baseline.js ./frontend/amplify/backend/function/saasRegionAdd/src/index.js
  sed -i -e "s/###CLUSTERACCOUNT###/${CLUSTER_ACCOUNT}/g" ./frontend/amplify/backend/function/saasRegionAdd/src/index.js
  sed -i -e "s/###MANAGEMENTACCOUNT###/${MANAGEMENT_ACCOUNT}/g" ./frontend/amplify/backend/function/saasRegionAdd/src/index.js

  echo -e "✓ configurations applied"

  #exit 0
# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0


  # deploy management cdk
  echo -e "Start deploying Management Plane ..."
  cd ./management_cdk
  npm install
  rm -rf ./lib/codecommit-codebase/node_modules
  cdk deploy --require-approval never
  echo -e "✓ Management plane deployed"

  # deploy amplify and frontend
  echo -e "Start deploying frontend ..."
  cd ./frontend
  npm install
  amplify init
  rm -f ./amplify/backend/backend-config.json
  cp ./backend-config.json ./amplify/backend/backend-config.json
  amplify init
  amplify push --yes
  echo -e "✓ Frontend deployed"

  echo -e "Starting frontend ..."
  npm run start
} || {
  echo -e "Error occurred"
}