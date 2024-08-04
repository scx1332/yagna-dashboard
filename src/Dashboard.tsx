import React, { useContext } from "react";
import "./Dashboard.css";

import TransactionFeed from "./TransactionFeed";
import { useConfigOrNull } from "./YagnaVersionProvider";
import { Routes, Route, Link } from "react-router-dom";
import Accounts from "./Accounts";
import AllowanceBoxDesignTime from "./AllowanceBoxDesignTime";
import Allowances from "./Allowances";
import Balance from "./Balance";
import BackendSettings from "./BackendSettings";
import { BackendSettingsContext } from "./BackendSettingsProvider";
import Web3Status from "./Web3Status";
import Invoices from "./Invoices";
import PayAgreements from "./PayAgreements";
import PayActivities from "./PayActivities";

const Dashboard = () => {
    const config = useConfigOrNull();

    const { backendSettings } = useContext(BackendSettingsContext);
    if (config == null) {
        return <div>Loading...</div>;
    }
    if (typeof config === "string") {
        return (
            <div>
                <div>{config}</div>
                <BackendSettings />
            </div>
        );
    }
    return (
        <div className="main-page">
            <div className="top-header">
                <div className="top-header-title">Yagna Dashboard</div>
                <div className="top-header-navigation">
                    <Link to="/">Main</Link>
                    <Link to="/invoices">Invoices</Link>
                    <Link to="/payAgreements">Pay Agreements</Link>
                    <Link to="/payActivities">Pay Activities</Link>
                    <Link to="/backendSettings">Settings</Link>
                </div>
            </div>
            <div className="main-content">
                <Routes>
                    <Route
                        path="/"
                        element={
                            <div>
                                <div>
                                    <div className={"padding"}>
                                        <p>
                                            Connected to payment driver API url:{" "}
                                            <a href={backendSettings.backendUrl}>{backendSettings.backendUrl}</a>
                                        </p>
                                        <textarea
                                            style={{ width: 800, height: 500 }}
                                            readOnly={true}
                                            value={JSON.stringify(config, null, 2)}
                                        />
                                    </div>
                                </div>
                            </div>
                        }
                    />
                    <Route path="invoices" element={<Invoices />} />
                    <Route path="payAgreements" element={<PayAgreements />} />
                    <Route path="payActivities" element={<PayActivities />} />
                    <Route path="backendSettings" element={<BackendSettings />} />
                </Routes>
            </div>
        </div>

    );
};

export default Dashboard;
