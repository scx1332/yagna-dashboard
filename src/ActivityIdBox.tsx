import React from "react";
import "./ActivityIdBox.css";

interface ActivityIdBoxProps {
    activityId: string | null;
}
function render(activityId: string, shortActivityId: string) {
    return (
        <span title={activityId}>
            <a href={`payActivities/${activityId}`}>{shortActivityId}</a>
        </span>
    );
}

const ActivityIdBox = (props: ActivityIdBoxProps) => {
    if (props.activityId == null) {
        return <div>N/A</div>;
    }
    const shortActivityId = props.activityId.substring(0, 8);

    return render(props.activityId, shortActivityId);
};

export default ActivityIdBox;
