/** *******************************************************************************************************************
  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
  
  Licensed under the Apache License, Version 2.0 (the "License").
  You may not use this file except in compliance with the License.
  You may obtain a copy of the License at
  
      http://www.apache.org/licenses/LICENSE-2.0
  
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.                                                                              *
 ******************************************************************************************************************** */
  import { FunctionComponent } from 'react';
  import { useHistory } from 'react-router-dom';
  import Container from 'aws-northstar/layouts/Container';
  import FormRenderer, { componentTypes, validatorTypes } from 'aws-northstar/components/FormRenderer';
  
  import { API } from 'aws-amplify';
  const apiName = 'api49106c82';
  
  const possibleRegions = [
      {
          label: 'Singapore',
          value: 'ap-southeast-1',
      },
      {
          label: 'Mumbai',
          value: 'ap-south-1',
      },
      {
          label: 'Sydney',
          value: 'ap-southeast-2',
      },
      {
          label: 'Tokyo',
          value: 'ap-northeast-1',
      },
      {
          label: 'Frankfurt',
          value: 'eu-central-1',
      },
  ]
  
  const formSchema = {
      header: 'New Customer Account',
      description: 'Add customer account',
      fields: [
          {
              component: componentTypes.TEXT_FIELD,
              name: 'code',
              label: 'Unique Code',
              helperText: 'Maxiumn 100 characters',
              isRequired: true,
              isDisabled: true,
              validate: [
                  {
                      type: validatorTypes.REQUIRED,
                  },
                  {
                      type: validatorTypes.MAX_LENGTH,
                      threshold: 80,
                  },
              ],
          },
          {
              component: componentTypes.TEXT_FIELD,
              name: 'name',
              label: 'Customer Name',
              helperText: 'Maxiumn 100 characters',
              isRequired: true,
              validate: [
                  {
                      type: validatorTypes.REQUIRED,
                  },
                  {
                      type: validatorTypes.MAX_LENGTH,
                      threshold: 80,
                  },
              ],
          },
          {
              component: componentTypes.SELECT,
              name: 'primaryRegion',
              label: 'Primary Region',
              placeholder: 'Choose suitable tags',
              multiSelect: false,
              options: possibleRegions,
              isRequired: false,
              checkboxes: false
          },
          {
              component: componentTypes.SELECT,
              name: 'backupRegion',
              label: 'Backup Region',
              placeholder: 'Choose Region for cross-regional backup',
              multiSelect: false,
              options: possibleRegions,
              isRequired: false,
              checkboxes: false,
          },
          {
              component: componentTypes.SWITCH,
              name: 'testAccount',
              label: 'Enable Test Account',
          },
      ],
  };
  
  const AccountEdit: FunctionComponent = () => {
      const history = useHistory();
  
      const onSubmit = async (data: any) => {
          console.log(JSON.stringify(data));
          const path = '/accounts/add';
          const myInit = { // OPTIONAL
                  headers: {}, // OPTIONAL
                  queryStringParameters: { 
                      "accountCode": data.code,
                      "accountName": data.name,
                      "accountPrimaryRegion": data.primaryRegion
                  }
          };
          API.get(apiName, path, myInit);
          history.push('/');
      }
  
      const onCancel = () => {
          history.push('/');
      }
  
      return (
          <Container>
              <FormRenderer
                  schema={formSchema}
                  onSubmit={onSubmit}
                  onCancel={onCancel}
              />
          </Container>
      );
  };
  
  export default AccountEdit;
  