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
import { FunctionComponent, useEffect, useState } from 'react';
import Inline from 'aws-northstar/layouts/Inline';
import Table, { Column } from 'aws-northstar/components/Table';
import Stack from 'aws-northstar/layouts/Stack';

import { API, Auth } from 'aws-amplify';
const apiName = 'api49106c82';

const columnDefinitions: Column<any>[] = [
    {
        id: 'id',
        width: 350,
        Header: 'User ID',
        accessor: 'id',
    },
    {
        id: 'email',
        width: 200,
        Header: 'E-Mail',
        accessor: 'email',
    },
];

const AdminList: FunctionComponent = () => {
    const [items, setItems] = useState([]);

    useEffect(() => {
        runOnce();
    }, []);
    
    const runOnce = async () => {
        try {
            var userpool = "";
            Auth.currentCredentials().then((info) => {
                console.log(info);
            });

            console.log(Auth);

            const path = '/users';
            const myInit = { // OPTIONAL
                headers: {}, // OPTIONAL
                queryStringParameters: { 
                    "userpool": "nothing"
                }
            };
          //  var regions = await API.get(apiName, path, myInit);
          //  setItems(regions);
            return true;
          } catch (err) {
            console.log({ err });
            return err;
          }
    }

    const tableActions = (
        <Inline>
        </Inline>
    );

        return (
            <Stack>
                <Table
                    onSelectionChange={()=> {}}
                    tableTitle="SaaS Administrators"
                    columnDefinitions={columnDefinitions}
                    items={items}
                    actionGroup={tableActions}
                    multiSelect={false}
                    disableRowSelect={true}
                    disablePagination={true}
                />
            </Stack>
        );    
};

export default AdminList;
