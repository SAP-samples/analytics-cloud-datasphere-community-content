import { BusyIndicator, Button, FlexBox, Label, Panel, Timeline, TimelineItem } from "@ui5/webcomponents-react"
import React from "react"
import DataImportServiceApi from "../api/dataImportService"
import Error from "./Error"
import "@ui5/webcomponents-icons/dist/pending";
import "@ui5/webcomponents-icons/dist/edit";
import "@ui5/webcomponents-icons/dist/expand-group";
import "@ui5/webcomponents-icons/dist/copy";
import { beautifyImportTypeName } from "./ImportTypeSelector"
import { prettifyJobStatus } from "./endUser/EndUserUpload"


function ModelJobsTimelineWrapper(props) {
    const [jobs, setJobs] = React.useState([])
    const [error, setError] = React.useState("")
    const [shownTimelineItems, setShownTimelineItems] = React.useState(5)

    const [networkLoading, setNetworkLoading] = React.useState(false)

    const filteredJobs = jobs.filter((job) => job.modelID === props.modelId)

    React.useEffect(() => {
        if (jobs.length === 0 && error === "") {
            setNetworkLoading(true)
            DataImportServiceApi.INSTANCE.getJobs().then((resp) => {
                setNetworkLoading(false)
                resp.sort((a, b) => new Date(b['lastUpdatedTime']) - new Date(a['lastUpdatedTime']))
                setJobs(resp)
            }).catch(err => {
                setNetworkLoading(false)
                setError(err.message)
            })
        }
    }, [props.modelId, jobs, error])
    if (props.modelId === "") {
        return (
            <Panel headerText="Job Timeline" collapsed={true}>
                <Label>Please select a model first.</Label>
            </Panel>
        );
    }
    return (
        <Panel headerText="Jobs Timeline" collapsed={true}>
            <div
                style={{ display: "flex", flexDirection: "column"}}
            >
                <Error message={error} close={() => setError("")} />
                {networkLoading ? <BusyIndicator active /> : undefined}
                <ModelJobsTimeline jobs={filteredJobs.slice(0, shownTimelineItems)} />
                <Button hidden={filteredJobs.length < 5} onClick={(() => setShownTimelineItems(Math.min(shownTimelineItems + 5, filteredJobs.length)))}>Load More ({shownTimelineItems} / {filteredJobs.length})</Button>
            </div>
        </Panel>
    )
}

function ModelJobsTimeline(props) {
    return (
        <Timeline waitForDefine={true}>
            {props.jobs.map((job) =>
                <TimelineItem
                    key={job.jobID}
                    titleText={job.owner + " " + prettifyJobStatus(job.status)}
                    subtitleText={beautifyImportTypeName(job.importType) + " " + job.lastUpdatedTime}
                    icon={job.status === 'COMPLETED' ? 'edit' : 'pending'}
                    waitForDefine={true}
                >
                    <div key={job.jobID}>
                        <ModelTimelineItem key={job.jobID} job={job} />
                    </div>
                </TimelineItem>
            )}
        </Timeline>
    )
}

function ModelTimelineItem(props) {
    const { job } = props
    const [additionalInfo, setAdditionalInfo] = React.useState(undefined)

    const [networkLoading, setNetworkLoading] = React.useState(false)
    const [error, setError] = React.useState("")

    const fetchAdditionalInfo = () => {
        if (!networkLoading) {
            setNetworkLoading(true)
            DataImportServiceApi.INSTANCE.getJobStatus(job.jobID).then((resp) => {
                setAdditionalInfo({ ...resp })
                setNetworkLoading(false)
            }).catch((err) => {
                setError(err.message)
                setNetworkLoading(false)
            })
        }
    }
    return (
        <FlexBox direction="Column">
            <Error message={error} />
            <AdditionalInformationTimelineItem additionalInformation={additionalInfo ? additionalInfo.additionalInformation : undefined} />
            <CopyJobButtons additionalInfo={additionalInfo} />
            <BusyIndicator active style={{ marginTop: '.5rem', display: networkLoading ? '' : 'None' }} />
            <Button style={{marginTop: '.5rem'}} disabled={additionalInfo !== undefined} icon="expand-group" design="Transparent" onClick={() => fetchAdditionalInfo()}><span>Fetch Additional Info</span></Button>
        </FlexBox>
    )
}

function AdditionalInformationTimelineItem(props) {
    if (props.additionalInformation && props.additionalInformation.failedNumberRows && props.additionalInformation.totalNumberRowsInJob) {
        const { failedNumberRows, totalNumberRowsInJob } = props.additionalInformation
        const successfulRows = parseInt(totalNumberRowsInJob) - parseInt(failedNumberRows)
        return (
            <FlexBox direction="Column">
                <Label>Total Rows: {totalNumberRowsInJob}</Label>
                <Label>Failed Rows: {failedNumberRows}</Label>
                <Label>Successful Rows: {successfulRows}</Label>
            </FlexBox>
        )
    } else {
        return (
            <div></div>
        )
    }
}

function CopyJobButtons(props) {
    if (props.additionalInfo === undefined) {
        return(
            <FlexBox direction="Row"></FlexBox>
        )
    }
    return (
        <FlexBox direction="Column">
            <Button
                style={{marginTop: '.5rem'}}
                design="Transparent"
                onClick={() => navigator.clipboard.writeText(JSON.stringify(props.additionalInfo))}
                icon="copy">Copy JSON Stats</Button>
            <Button
                style={{marginTop: '.5rem'}}
                disabled={!props.additionalInfo.invalidRowsURL}
                tooltip={!props.additionalInfo.invalidRowsURL ? "You must validate or run the job to see invalid rows" : ""}
                design="Transparent"
                onClick={() => navigator.clipboard.writeText(props.additionalInfo.invalidRowsURL)}
                icon="copy">Copy Invalid Rows URL</Button>
        </FlexBox>
    )
}

export default ModelJobsTimelineWrapper