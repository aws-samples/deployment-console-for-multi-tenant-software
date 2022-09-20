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
import { FunctionComponent, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Container from 'aws-northstar/layouts/Container';
import FormRenderer, { componentTypes, validatorTypes } from 'aws-northstar/components/FormRenderer';

import { API } from 'aws-amplify';
const apiName = 'api49106c82';

const AccountAdd: FunctionComponent = () => {
    const history = useHistory();
    const [possiblePrimaryRegions, setPossiblePrimaryRegions] = useState([]); 
  //  const [possibleBackupRegions, setPossibleBackupRegions] = useState([]); 

    const initialValues = {
        code: 'haribo',
        primaryRegion: 'ap-south-1',
        name: 'Haribo',
       // backupRegion: 'none'
    }

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
                validate: [
                    {
                        type: validatorTypes.REQUIRED,
                    },
                    {
                        type: validatorTypes.PATTERN,
                        message: 'only lower case letters',
                        pattern: /^[a-z]+$/i,
                    },
                ],
            },
            {
                component: componentTypes.TEXT_FIELD,
                name: 'name',
                label: 'Customer Name',
                helperText: 'Maxiumn 80 characters',
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
                options: possiblePrimaryRegions,
                isRequired: true,
                checkboxes: false,
                validate: [
                    {
                        type: validatorTypes.REQUIRED,
                    },
                ],
            }
      /*      ,
            {
                component: componentTypes.SELECT,
                name: 'backupRegion',
                label: 'Backup Region',
                placeholder: 'Choose Region for cross-regional backup',
                multiSelect: false,
                options: possibleBackupRegions,
                isRequired: false,
                checkboxes: false,
            },
            {
                component: componentTypes.SWITCH,
                name: 'testAccount',
                label: 'Enable Test Account',
            },
            */
        ],
    };

    useEffect(() => {
        runOnce();
    }, []);

    const runOnce = async () => {
        try {
            const path = '/regions';
            const myInit = { // OPTIONAL
                headers: {}, // OPTIONAL
            };
            var regions = await API.get(apiName, path, myInit);
            var tempRoleOptions: any = [];
            regions.forEach((region: any) => {
                tempRoleOptions.push({
                    label: region.regionName, value: region.regionCode
                });
            });
            setPossiblePrimaryRegions(tempRoleOptions);

         //   tempRoleOptions.push({
         //       label: 'No Backup', value: 'none'
         //   });
         //   setPossibleBackupRegions(tempRoleOptions);
            return true;
          } catch (err) {
            console.log({ err });
            return err;
          }
    }

    const onSubmit = async (data: any) => {
      //  console.log(JSON.stringify(data));
        const path = '/accounts/add';
        const myInit = { // OPTIONAL
                headers: {}, // OPTIONAL
                queryStringParameters: { 
                    "accountCode": data.code,
                    "accountName": data.name,
                    "accountPrimaryRegion": data.primaryRegion
                  //  "accountBackupEnabled": data.backupRegion
                }
        };
      //  console.log(myInit);
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
                initialValues={initialValues}
                onSubmit={onSubmit}
                onCancel={onCancel}
            />
        </Container>
    );
};

export default AccountAdd;
