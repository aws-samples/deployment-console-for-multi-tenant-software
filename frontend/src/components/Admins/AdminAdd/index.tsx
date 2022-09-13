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

import { API } from "aws-amplify";
const apiName = 'api49106c82';

const possibleTags = [
    {
        label: 'Entertainment',
        value: '1',
    },
    {
        label: 'Culture',
        value: '2',
    },
]

const formSchema = {
    header: 'New Sight',
    description: 'Add an new sight to your cities catalogue',
    fields: [
        {
            component: componentTypes.TEXT_FIELD,
            name: 'name',
            label: 'Name',
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
            component: componentTypes.TEXTAREA,
            name: 'longText',
            label: 'Description',
            helperText: 'Shown in the details page and read to the user, if feature is activated for respective language',
            isRequired: true,
            validate: [
                {
                    type: validatorTypes.REQUIRED,
                },
                {
                    type: validatorTypes.MAX_LENGTH,
                    threshold: 1000,
                },
            ],
        },
        {
            component: componentTypes.TEXT_FIELD,
            name: 'longitude',
            label: 'Longitude',
            helperText: 'www.openstreetmap.org right click Show address [LATITUDE, LONGITUDE]',
            isRequired: true,
            type: 'number',
            validate: [
                {
                    type: validatorTypes.REQUIRED,
                },
                {
                    type: validatorTypes.MIN_NUMBER_VALUE,
                    includeThreshold: true,
                    value: -180,
                },
                {
                    type: validatorTypes.MAX_NUMBER_VALUE,
                    includeThreshold: false,
                    value: 80,
                },
            ],
        },
        {
            component: componentTypes.SELECT,
            name: 'tags',
            label: 'Tags',
            placeholder: 'Choose suitable tags',
            multiSelect: true,
            options: possibleTags,
            isRequired: false,
            checkboxes: true
        },
    ],
};

const AdminAdd: FunctionComponent = () => {
    const history = useHistory();

    const onSubmit = async (data: any) => {
        console.log(JSON.stringify(data));
        const path = '/regions';
            const myInit = { // OPTIONAL
                headers: {}, // OPTIONAL
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

export default AdminAdd;
