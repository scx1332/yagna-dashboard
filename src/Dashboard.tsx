import React, { useContext } from "react";
import "./Dashboard.css";

import { Routes, Route, Link } from "react-router-dom";
import BackendSettings from "./BackendSettings";
import { BackendSettingsContext } from "./BackendSettingsProvider";
import Invoices from "./Invoices";
import PayAgreements from "./PayAgreements";
import PayActivities from "./PayActivities";
import BatchOrders from "./PayBatchOrders";
import PayCycles from "./PayCycles";
import PayPayments from "./PayPayments";

const Dashboard = () => {
    const { backendSettings } = useContext(BackendSettingsContext);
    if (backendSettings.yagnaServers.length == 0) {
        return (
            <div>
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
                    <Link to="/cycles">Pending</Link>
                    <Link to="/batchOrders">Batch orders</Link>
                    <Link to="/invoices">Invoices</Link>
                    <Link to="/payPayments">Pay Payments</Link>
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
                                        </p>
                                    </div>
                                </div>
                            </div>
                        }
                    />
                    <Route path="invoices" element={<Invoices />} />
                    <Route path="cycles" element={<PayCycles />} />
                    <Route path="batchOrders" element={<BatchOrders />} />
                    <Route path="payPayments" element={<PayPayments />} />
                    <Route path="payAgreements" element={<PayAgreements />} />
                    <Route path="payActivities" element={<PayActivities />} />
                    <Route path="backendSettings" element={<BackendSettings />} />
                </Routes>
            </div>
        </div>
    );
};

export default Dashboard;
