import fetch from 'node-fetch';


const getData = async (url) => {
    try{
        const response = await fetch(url);
        if(response.status === 200){
            const data = await response.json();
            return data;
        }
        else{
            console.log("Error: ", response.status);
            return 'Error getting data from server: ERROR CODE => ' + response.status;
        }
    }
    catch(error){
        console.log(error);
        return error;
    }
}

export const getDevices = async (req, res) => {
    let link = process.env.DEVICE_LINK + '/list?'
    link += 'tenantId=' + process.env.TENANT_ID
    link += '&secretToken=' + process.env.SECRET_TOKEN
    link += '&limit=10&offset=0&status=ANY_STATUS&type=ANY'

    try{
        const data = await getData(link);
        res.send(data);
    }
    catch(error){
        console.log(error);
    }
}

export const getDevice = async (req = 5064, res) => {
    let link = process.env.DEVICE_LINK + '/info?'
    link += '&secretToken=' + process.env.SECRET_TOKEN
    link += '&endpointId=' + req.params.id

    try{
        const data = await getData(link);
        res.send(data);
    }
    catch(error){
        console.log(error);
    }
}



export const getEventsFromDevice = async (req, res) => {
    let link = process.env.EVENT_LINK + '/events?'
    link += 'tenantId=' + process.env.TENANT_ID
    link += '&secretToken=' + process.env.SECRET_TOKEN
    link += '&pageSize=20'
    link += '&deviceId=' + req.params.id

    try{
        const data = await getData(link);
        res.send(data);
    }
    catch(error){
        console.log(error);
    }
}