import React, { useCallback, useContext, useEffect } from "react";
import InvoiceBox from "./InvoiceBox";
import Invoice from "./model/Invoice";
import { BackendSettingsContext } from "./BackendSettingsProvider";
import { backendFetch } from "./common/BackendCall";

interface GetInvoicesResponse {
    invoices: Invoice[];
}

const Invoices = () => {
    const [invoices, setInvoices] = React.useState<GetInvoicesResponse | null>(null);
    const { backendSettings } = useContext(BackendSettingsContext);

    const loadInvoices = useCallback(async () => {
        const response = await backendFetch(backendSettings, "/payment-api/v1/invoices");
        const response_json = await response.json();
        setInvoices({ invoices: response_json });
    }, []);

    function row(invoice: Invoice, i: number) {
        return <InvoiceBox key={i} invoice={invoice} />;
    }

    useEffect(() => {
        loadInvoices().then();
    }, [loadInvoices]);
    return (
        <div>
            <h1>Invoices</h1>
            {invoices?.invoices.map(row)}
            {JSON.stringify(invoices)}
        </div>
    );
};

export default Invoices;
