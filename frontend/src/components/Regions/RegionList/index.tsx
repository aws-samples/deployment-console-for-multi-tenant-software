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
import Button from 'aws-northstar/components/Button';
import Icon from 'aws-northstar/components/Icon';
import Inline from 'aws-northstar/layouts/Inline';
import Table, { Column } from 'aws-northstar/components/Table';

import { API } from 'aws-amplify';
const apiName = 'api49106c82';

const columnDefinitions: Column<any>[] = [
    {
        id: 'regionCode',
        width: 200,
        Header: 'Region Code',
        accessor: 'regionCode',
    },
    {
        id: 'regionName',
        width: 400,
        Header: 'Name',
        accessor: 'regionName',
    },
    {
        id: 'status',
        width: 400,
        Header: 'Status',
        accessor: 'status',
    }
];

const RegionList: FunctionComponent = () => {
    const [selectedItems, setSelectedItems] = useState<object[]>([]);
    const [items, setItems] = useState([]);
    const history = useHistory();

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
            setItems(regions);
            return true;
          } catch (err) {
            console.log({ err });
            return err;
          }
    }

    const onRefreshClick = () => {
        window.location.reload();
    };

    const onAddClick = () => {
        history.push('/regionAdd');
    };

    const onRemoveClick = async () => {
        const selectedItem: any = selectedItems[0];
        const path = '/regions/remove';
        const myInit = { // OPTIONAL
                headers: {}, // OPTIONAL
                queryStringParameters: { 
                    "regionCode": selectedItem.id,
                }
        };
        await API.get(apiName, path, myInit);      
        window.location.reload();       
    };

    const handleSelectionChange = (items: object[]) => {
        if (!(selectedItems.length === 0 && items.length === 0)) {
            setSelectedItems(items);
        }
    };

    const tableActions = (
        <Inline>
            <Button onClick={onRefreshClick}>
                <Icon name="Refresh" />
            </Button>
            <Button onClick={onRemoveClick}>
                Remove
            </Button>
            <Button onClick={onAddClick} variant="primary">
                Add
            </Button>
        </Inline>
    );

    return (
        <Table
            onSelectionChange={handleSelectionChange}
            tableTitle="Available Regions"
            columnDefinitions={columnDefinitions}
            items={items}
            actionGroup={tableActions}
            multiSelect={false}
            disablePagination={true}
        />
    );
};

export default RegionList;
