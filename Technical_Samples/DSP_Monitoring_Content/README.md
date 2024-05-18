# SAP Datasphere Monitoring Content

## Content Package Files
SAP_CC_DSP_Monitoring_Source_Tables.package  
SAP_CC_DSP_Monitoring_Reporting_Tables.package

## Last Released:
2023.05

## What´s New
Initial Release

## Descripton - What is the Monitoring Content About?
It offers a configuration that persists data from various monitoring relevant tables and views.
 - This persistence runs are delta enabled (by timestamp)
 - Task chains are defined to schedule the update
 - The data rentention time is configurable: you can define for how many days you like to keep persisted data. This insures that the data volume is kept in fixed boundaries.

The data to persist can be sourced from two different systems. Assuming you have a dev. and prov. environment, you can create the content in one of these tenants, and collect the data from both. One place to define views and e.g. stories to run evaluations for data from both tenant.

**Note:** If you are using just one tenant, we have to fake the second one to deploy the entities. As you can configure from where to load, you can then e.g. disable the remote load. Hence no duplication of data.

In addition, several dimension tables are populated to enable a consisten reporting approach and to model something like a star-schema in the fact view. Examples are DATE, TIME, SPACE, STORY and WIDGET information and more.

For reporting
 - Two access modes (persisted only or including real time data) are supported
 - Data Access Controls to protect your data are delivered as well. You just need to assign them to the respective view
 - Protection patterns like "Admin Access", "access to my data only" or to a "group of spaces" have been implemented. 

## Details
Please check the attached presentation for more detailed information on the Monitoring Content.

## Connectivity
SAP HANA Cloud in one or more SAP Datasphere instances.

## Download/Install Instructions
Please check the general documentation [here](https://help.sap.com/docs/SAP_ANALYTICS_CLOUD/42093f14b43c485fbe3adbbe81eff6c8/ef516563b3fe4c69b6f718f17ed94cdf.html).
Please follow the setup and configuration instructions below to setup the SAP Datasphere Monitoring Content.

## Initial Setup of Monitoring Content

### Space and User Setup
- If it does not exist, create the space **SAP_ADMIN (Space Name: Administration (SAP)** and enable as "Monitoring Space".
- Ensure your SAP Datasphere user has sufficient privileges to access and configure content.

### Space Configuration (mandatory)
- HANA Connection for fetching data from a separat tenant:
  - Create an analysis user and note down the HANA server and user/passwort
    - if you are using a remote system: create analysis user in the remote datasphere system
    - if not: create an Analysis User in your current datasphere system (workaround, required once for deployement of tables, can be adjusted later)
  - Ensure that the DigiCert Global Root CA and DigiCert Global Root G2 are uploaded in SAP Datasphere - see also [here](https://help.sap.com/docs/hana-cloud-database/sap-hana-cloud-sap-hana-database-security-guide/secure-communication-between-sap-hana-and-sap-hana-clients) and [here](https://www.digicert.com/kb/digicert-root-certificates.htm)
  - Update the Remote Connection REMOTE_MONITORING_DATA with the Analysis User credentials
  - Use the information of the Analysis User
  - Save, deploy and verify that the connection is valid.

### Update existing remote/local tables (only mandatory if already in the repository)

Views with recently added columns require a metadata refresh:
    - TASK_LOGS_V_EXT: Refresh the definition to ensure that we are on the latest status
    - TASK_SCHEDULES_V_EXT: refresh the definition to ensure that we are on the latest status
    - M_MULTIDIMENSIONAL_STATEMENTS

Hint: The update can be triggered from the datasphere design time UI. Navigate to the view/table and press the "refresh" button. A dialog might come up and ask you which changes to consume. Select all and save and re-deploy the table.

Remote tables which have been replicated already - but with a different technical name. It is not possible to have one remote table imported two times with different names. Hence we have to resolve this conflict.

Example for the conflict: The table M_MULTIDIMENSIONAL_STATEMENT_STATISTICS have been replicated using the technical name M_MULTIDIMENSIONAL_STATEMENT_S. The content expects now M_MULTIDIMENSIONAL_STATEMENT_STATISTICS.

Resolving options:
  - Create a view M_MULTIDIMENSIONAL_STATEMENT_STATISTICS which wraps the remote table M_MULTIDIMENSIONAL_STATEMENT_S. During the import of source tables, skip the import of the remote tables.
  - Rename the source table and adjust your existing scripts and views.   

### Import Source Table Definitions
Once you have finished the space configuration, we are ready to import the content.
First import the source tables using the .package file **SAP_CC_DSP_Monitoring_Source_Tables.package**. It's recommended to choose the import option "do not overwrite existing content".

Hint: On the import dialog, navigate to the second tab "Import Options" and select the option "Deploy after import".

All tables need to be available and deployed before starting the import of the views.

### Import Configuration of Data Inbound

Let us continue with the full configuration of the inbound part of the monitoring data:
Import the .package file **SAP_CC_DSP_Monitoring_Reporting_Tables.package** and don't forget the check the flag for automatic deployment. 


**A brief introduction to the folder structure:**
 - Each folders with leading number represent a source table. The name of the source table is part of the folder name. 
 - Folder **Dimensions** contains all dimensions defined for reporting purposes
 - Folder **DataReplication** contains all dataflows required to update the replicated date
 - Folder **Configuration** contains all configuration tables.

Note: the version 1.0.0 does currently not contain all folder yet, but this will be fixed in a next update soon.

We have finished the inital import of the reporting entities. The next chapter describes the initial configuration of the content, how to enable authorization on the data and how to schedule the replication.

## Configuration of Monitoring Content

### Mandatory: Days to keep data and Source Selection
- Upload or manually enter the following rows into table CONFIGURATION. Select via true/false which source should be loaded.

| Name | Value | Enabled |
| ---- | ----- | ------- |
|KEEP_HISTORY_DAYS|30|true|
|LOAD_FROM_LOCAL_HOST||true/false|
|LOAD_FROM_REMOTE_HOST||true/false|

If you have only local data, set LOAD_FROM_REMOTE_HOST = false and LOAD_FROM_LOCAL_HOST = true.

The proposed value to keeping history is set to 30 days. To understand the data volume created by the replication, see chapter ![](#Retention Time of Data) 

### Mandatory: Schedule Data Replication

In the folder "Monitoring Inbound" => "DataReplicatoin" you will find a set of task chains. Schedule them to run e.g. every hour.

Thoughts about the frequency:
 - It needs to be faster than the retention time of the source. E.g. if the M_EXPENSIVE_STATEMENT will contain data for the past 5 hours, the scheduling should be below e.g. 3 hours (for safety)
 - When using Real-time access, the data volume fetched remotely is higher and hence the performance is reduced

### Optional: Addition manual configurations

User friendly text for DATABASE_ID and HOST
 - After the initial load, the dimension HOST_DIM is filled. 
 - Open the dimension in the table editor and manually change the default text for the database_id. It will not be overwritten during a subsequent load.

Grouping of Spaces
 - A space group is automatically derived from the space_id. Rule is to use substring before first underscore ('_') as group id.
 - Example: SAP_INBOUND, SAP_HARMONIZE and SAP_REPORTING will all have the GROUP SAP.

 Authorizations: HANA Application User
 - The data accessc control TCT_DAC_APP_USER_DAC can be used to control access to data, where an application user is available. This is typically the case for HANA statistic views.
 - Default Authorization: Every User can see his on data => no configuration required 
 - Admin Authorization: Add application user to table TCT_DAC_ADMIN_USERS_LOC => full access to data 

 Authorizations: Spaces 
 - The data access control TCT_DAC_SPACE_DATABASE_DAC can the used to controll access to data, where a space is available.
 - Per default, all access is blocked 
 - Admin Authorization: Add application user to table TCT_DAC_ADMIN_USERS_LOC => full access to data. Note that this is the same tables as used for the HANA application user.
 - User specific authorization: Add application user, space group and database id to table TCT_DAC_SPACE_GROUP_LOC.

 ### Retention Time of Data 

 The default proposed is 30 days. The major limit here is the data volume (on disc) you like to spend to monitoring data. Below you find typical groth rates in terms of records count and memory per persisted table (naming *_LOC):

 |Table Name|Disk Usage per x records|Records per Day|Disk Usage per Day|  
 | -------- | ------------------ | ------------- | -------------|
 |M_EXPENSIVE_STATEMENTS|17,6 MB / 100.000 recs||
 |M_MULTIDIMENSIONAL_STATEMENTS|10,0 MB / 100.000 recs||
 |M_MULTIDIMENSIONAL_STATEMENT_STATISTICS|14,1 MB / 100.000 recs|||
 |M_LOAD_HISTORY_SERVICE|4,4 MB / 100.000 recs|8640 x number of Ports (2 to 3) => approx. 25.000 records|
 |M_HOST_INFORMATION|0,2 MB / 100 recs|no relevant increase|
 |SPACE_SCHEMAS|0,1MB / 1000recs|no relevant increase|
 |SPACE_USERS||no relevant increase|
 |TASK_LOGS_V_EXT|5,1 MB / 100.000 recs||
 |TASK_SCHEDULES||no relevant increase|
 |TASK_LOG_MESSAGES_V_EXT|4,3 MB / 100.000 recs||
 
## More Information
N/A

## Contact
[Olaf Fischer](mailto:olaf.fischer@sap.com)
 
