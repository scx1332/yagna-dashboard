import React, {useCallback, useEffect, useLayoutEffect, useRef, useState} from "react";
import PayAgreement from "./model/PayAgreement";
import {backendFetchYagna, getYangaServerInfo} from "./common/BackendCall";
import {YagnaVersion} from "./model/YagnaVersion";
import {Button, Fade, Input, TextField} from "@mui/material";
import {YagnaServer} from "./common/BackendSettings";
import ContractDetails from "./ContractDetails";
import Paper from '@mui/material/Paper';

function useWindowSize() {
    const [size, setSize] = useState([0, 0]);
    useLayoutEffect(() => {
        function updateSize() {
            setSize([window.innerWidth, window.innerHeight]);
        }

        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);
    return size;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface WelcomeScreenProps {
}

const WelcomeScreen = (props: WelcomeScreenProps) => {
    const [frameCount, setFrameCount] = useState<DOMHighResTimeStamp>(0); // State to track the current frame count
    const requestRef = useRef<number>();  // Holds the requestAnimationFrame id
    const previousTimeRef = useRef<DOMHighResTimeStamp>();  // Holds the previous timestamp

    const [yagnaVersion, setYagnaVersion] = useState<YagnaVersion | null>(null);

    const [yagnaBackendUrl, setYagnaBackendUrl] = useState<string>("http://127.0.0.1:7465");
    const loadVersion = useCallback(async () => {
        try {
            const response = await fetch(`${yagnaBackendUrl}/version/get`);
            const response_json = await response.json();
            setYagnaVersion(response_json.current);
        } catch (e) {
            setYagnaVersion(null)
        }
    }, [yagnaBackendUrl]);
    const [currentApplicationKey, setCurrentApplicationKey] = useState<string>("");

    const [checkInProgress, setCheckInProgress] = React.useState(false);
    const [checkSuccessful, setCheckSuccessful] = React.useState(false);
    const [checkResponse, setCheckResponse] = React.useState("");
    const [checkError, setCheckError] = React.useState("");
    const [checkData, setCheckData] = React.useState<YagnaServer | null>(null);
    const check = useCallback(async () => {
        //
        const settingsToCheck = {
            url: yagnaBackendUrl,
            appKey: currentApplicationKey,
        };
        setCheckResponse(`Connecting to ${yagnaBackendUrl} ...`);
        setCheckInProgress(true);
        setCheckSuccessful(false);
        setCheckData(null);
        setCheckError("");
        try {
            const server = await getYangaServerInfo(settingsToCheck);

            setCheckInProgress(false);
            setCheckResponse(`Success`);
            setCheckSuccessful(true);
            setCheckData(server);
        } catch (e) {
            setCheckError(`Failed to connect to ${yagnaBackendUrl}`);
            setCheckInProgress(false);
        }
    }, [yagnaBackendUrl, currentApplicationKey]);


    const isYagnaVersionValid = yagnaVersion != null && yagnaVersion.name != null;


    // Animation function that gets called every frame
    const animate = (time: DOMHighResTimeStamp) => {
        if (previousTimeRef.current != undefined) {
            // Calculate the elapsed time between frames
            const deltaTime = time - previousTimeRef.current;

            //Or if you want to update after a specific time (e.g. 60 frames per second)
            //if (deltaTime > 1000 / 60) { // for 60 FPS
            setFrameCount(prevCount => prevCount + 1);
            //}
        }

        previousTimeRef.current = time; // Update the previous timestamp for the next frame
        requestRef.current = requestAnimationFrame(animate); // Request the next frame
    }
    useEffect(() => {
        loadVersion().then();
        // Start the animation loop
        requestRef.current = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(requestRef.current ?? 0); // Cleanup the animation loop on unmount
    }, []);  // Empty array to run only once on mount

    const currentWidth = useRef<number>(window.innerWidth);
    const currentHeight = useRef<number>(window.innerHeight);

    const targetX = window.innerWidth;
    const targetY = window.innerHeight;

    const newWidth = currentWidth.current + (targetX - currentWidth.current) * 0.1;
    const newHeight = currentHeight.current + (targetY - currentHeight.current) * 0.1;

    /*
    if (Math.abs(newWidth - targetX) / (targetX + newWidth) > 0.2 || Math.abs(newHeight - targetY) / (targetY + newHeight) > 0.2) {
        newWidth = targetX;
        newHeight = targetY;
    }*/


    currentWidth.current = newWidth;
    currentHeight.current = newHeight;

    const divX = newWidth / 10;
    const divY = newHeight / 15;
    const maxScaleWidth = 1200;
    const minScaleWidth = 300;
    const scaleWidth = Math.max(Math.min(newWidth, maxScaleWidth), minScaleWidth);
    const fontSizeTitleComputed = 10 + scaleWidth / 20;
    const fontSizeSubTitleComputed = 10 + scaleWidth / 40;
    return (
        <div style={{
            overflow: "hidden",
            position: "absolute",
            left: 0,
            top: 0,
            width: window.innerWidth - 20,
            height: window.innerHeight - 20
        }}>
            <div style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: currentWidth.current,
                height: currentHeight.current
            }}>
                <div className="welcome-box-title"
                     style={{left: divX, top: divY, display: "flex", flexDirection: "column", position: "absolute"}}>

                    <div className="welcome-box-title"
                         style={{marginBottom: 10, fontSize: fontSizeTitleComputed * 0.9}}>Welcome
                        to <br/>
                        YAGNA DASHBOARD
                    </div>
                    <div style={{display: "flex", alignItems: "center"}}>
                    <TextField label="Service address" value={yagnaBackendUrl} onChange={(e)=>setYagnaBackendUrl(e.target.value)}></TextField>
                        <Button disabled={yagnaBackendUrl == ""} onClick={() => {
                            loadVersion().then()
                        }} variant="outlined" className="welcome-box-button" style={{
                            marginLeft: 10,
                            marginRight: 10,
                            fontSize: fontSizeSubTitleComputed * 0.7
                        }}>VERSION CHECK</Button>
                    </div>
                    <Fade in={yagnaVersion != null}>
                        <div className="welcome-box-subtitle"
                             style={{
                                 marginTop: 10,
                                 marginBottom: 30,
                                 fontSize: fontSizeSubTitleComputed * 0.8
                             }}>
                            Detected yagna service: {yagnaVersion?.name ?? ""}
                        </div>
                    </Fade>
                    <div style={{display: "flex", alignItems: "center"}}>
                        <TextField onChange={(e) => setCurrentApplicationKey(e.target.value)} label="Application key"
                                   sx={{
                                       marginTop: 0,
                                   }} value={currentApplicationKey}></TextField>
                        <Button disabled={currentApplicationKey == ""} onClick={() => {
                            check().then()
                        }} variant="outlined" className="welcome-box-button" style={{
                            marginLeft: 10,
                            marginRight: 10,
                            fontSize: fontSizeSubTitleComputed * 0.7
                        }}>CONNECT
                        </Button>
                    </div>
                    <Fade in={checkSuccessful} timeout={1000}>
                        <Paper sx={{marginTop: 1, marginBottom: 1.5, padding: 1}}>
                            <div className="welcome-box-identity" style={{display: "flex", flexDirection: "column"}}>


                                <TextField sx={{}} label={"Appkey name"} value={checkData?.name ?? ""}></TextField>
                                <TextField sx={{}} label={"Appkey role"} value={checkData?.role ?? ""}></TextField>

                                <div style={{fontSize: fontSizeSubTitleComputed * 0.6}}>
                                    <ContractDetails chainId={1} contractAddress={checkData?.identity ?? ""}
                                                     isAddress={true}/>

                                </div>
                                <div>
                                    <Button variant="outlined" className="welcome-box-button" style={{
                                        marginBottom: 10,
                                        fontSize: fontSizeSubTitleComputed * 0.7
                                    }}>APPLY AND CONTINUE
                                    </Button>
                                </div>
                            </div>
                        </Paper>
                    </Fade>

                </div>

            </div>
        </div>
    );
}

export default WelcomeScreen;