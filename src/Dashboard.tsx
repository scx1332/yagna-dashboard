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
        <div>
            <div>
                <div className="top-header">
                    <div className="top-header-title">Yagna Dashboard</div>
                    <div className="top-header-navigation">
                        <Link to="/">Main</Link>
                        <Link to="/payments">Payment module</Link>
                        <Link to="/backend_settings">Settings</Link>
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
                        <Route path="feed" element={<TransactionFeed />} />
                        <Route path="accounts" element={<Accounts />} />
                        <Route path="allowances" element={<Allowances />} />
                        <Route path="balance/:account" element={<Balance />} />
                        <Route path="web3status" element={<Web3Status />} />
                        <Route path="design_allowance_box" element={<AllowanceBoxDesignTime />} />
                        <Route path="backend_settings" element={<BackendSettings />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
