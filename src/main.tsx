import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Dashboard from "./Dashboard";
import { BrowserRouter } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import { BackendSettingsProvider } from "./BackendSettingsProvider";
import { ConfigProvider} from "./ConfigProvider";
const rootEl = document.getElementById("root");
if (!rootEl) {
    throw new Error("No root element found");
}
const root = ReactDOM.createRoot(rootEl);

root.render(
    <React.StrictMode>
        <BackendSettingsProvider>
            <ConfigProvider>
                <BrowserRouter basename={"dashboard"}>
                    <Routes>
                        <Route path="/*" element={<Dashboard />} />
                    </Routes>
                </BrowserRouter>
            </ConfigProvider>
        </BackendSettingsProvider>
    </React.StrictMode>,
);
