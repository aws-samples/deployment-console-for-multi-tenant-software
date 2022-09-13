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

const initialValues = {
    code: 'ap-south-1',
    name: 'Mumbai',
}

const formSchema = {
    header: 'Initialize New Region',
    description: 'Enable new region to deploy solution',
    fields: [
        {
            component: componentTypes.TEXT_FIELD,
            name: 'code',
            label: 'Region Code',
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
            component: componentTypes.TEXT_FIELD,
            name: 'name',
            label: 'Region Name',
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
        }
    ],
};

const RegionAdd: FunctionComponent = () => {
    const history = useHistory();

    const onSubmit = async (data: any) => {
        console.log(JSON.stringify(data));
        const path = '/regions/add';
        const myInit = { // OPTIONAL
            headers: {}, // OPTIONAL
            queryStringParameters: { 
                "regionCode": data.code,
                "regionName": data.name
            }
        };
        API.get(apiName, path, myInit);
        history.push('/regionList');
    }

    const onCancel = () => {
        history.push('/regionList');
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

export default RegionAdd;
