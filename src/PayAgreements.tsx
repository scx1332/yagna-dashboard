import React, {useCallback, useContext, useEffect} from "react";
import PayAgreementBox from "./PayAgreementBox";
import PayAgreement from "./model/PayAgreement";
import {BackendSettingsContext} from "./BackendSettingsProvider";
import {backendFetchYagna} from "./common/BackendCall";
import AgreementIdBox from "./AgreementIdBox";
import DateBox from "./DateBox";
import "./PayAgreements.css";
import {DataGrid, GridCellParams, GridColDef, GridRowModel} from '@mui/x-data-grid';
import {styled, TableCell} from "@mui/material";

interface GetPayAgreementsResponse {
    payAgreements: PayAgreement[];
}

const columns: GridColDef[] = [
    {
        field: 'id',
        headerName: 'ID',
        width: 90,
        type: 'string',
        renderCell: (params) => (
            <AgreementIdBox agreementId={params.row.id} ownerId={params.row.ownerId}/>
        )
    },
    {
        field: 'role',
        headerName: 'Role',
        width: 50,
        editable: true,
    },
    {
        field: 'ownerId',
        headerName: 'Owner',
        width: 200,
        editable: true,
    },
    {
        field: 'totalAmountAccepted',
        type: 'string',
        headerName: 'Amount accepted',
        width: 200,
    },
    {
        field: 'totalAmountScheduled',
        type: 'string',
        headerName: 'Amount scheduled',
        width: 200,
    },
    {
        field: 'totalAmountPaid',
        type: 'string',
        headerName: 'Amount paid',
        width: 200,
    },
    {
        field: 'createdTs',
        headerName: 'Created',
        width: 160,

        type: 'string',
        renderCell: (params) => (
            <DateBox date={params.row.createdTs} title={""}/>
        ),
        cellClassName: (params) => (
            "created-ts-cell"
        )
    },

];


const PayAgreements = () => {
    const [payAgreements, setPayAgreements] = React.useState<GetPayAgreementsResponse | null>(null);
    const {backendSettings} = useContext(BackendSettingsContext);

    const loadPayAgreements = useCallback(async () => {
        let payAgreements: PayAgreement[] = [];
        for (const yagna_server of backendSettings.yagnaServers) {
            const response = await backendFetchYagna(yagna_server, "/payment-api/v1/payAgreements");
            const response_json = await response.json();
            const payAgreementsLoc = response_json;
            payAgreements = payAgreements.concat(payAgreementsLoc);
            // add server information
        }
        const payAgreementsSorted = payAgreements
            .sort((a: PayAgreement, b: PayAgreement) => {
                return a.createdTs.localeCompare(b.createdTs);
            })
            .reverse();
        setPayAgreements({payAgreements: payAgreementsSorted});
    }, []);


    useEffect(() => {
        loadPayAgreements().then();
    }, [loadPayAgreements]);


    return (
        <div>
            <h1>PayAgreements</h1>


            <table className={"pay-agreements-table"}>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Role</th>
                    <th>Owner</th>
                    <th>Accepted amount</th>
                    <th>Scheduled amount</th>
                    <th>Paid amount</th>
                    <th>Created</th>
                </tr>
                </thead>
                <tbody>
                {payAgreements?.payAgreements.map((agreement: PayAgreement) => (
                    <tr key={agreement.id}>
                        <td><AgreementIdBox agreementId={agreement.id} ownerId={agreement.ownerId}/></td>
                        <td>{agreement.role}</td>
                        <td>{agreement.ownerId}</td>
                        <td>{agreement.totalAmountAccepted}</td>
                        <td>{agreement.totalAmountScheduled}</td>
                        <td>{agreement.totalAmountPaid}</td>
                        <td><DateBox date={agreement.updatedTs} title={""}/></td>
                    </tr>
                ))}
                </tbody>
            </table>

            <DataGrid
                sx={{
                    boxShadow: 2,
                    border: 2,
                    borderColor: 'primary.light',
                    '& .MuiDataGrid-cell:hover': {
                        color: 'primary.main',
                    },

                }}
                rows={payAgreements?.payAgreements ?? []}
                columns={columns}
                initialState={{
                    pagination: {
                        paginationModel: {
                            pageSize: 100,
                        },
                    },
                }}
                pageSizeOptions={[2, 5, 10, 20, 50, 100]}
                checkboxSelection
                disableRowSelectionOnClick
            />

            {JSON.stringify(payAgreements)}
        </div>
    );
};

export default PayAgreements;
