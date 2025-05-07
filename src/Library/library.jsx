export const $ajax_post = (ref, data, successcallback, errorcallback) => {
    // const { setLoading } = useLoading();

    // axios.post();    
    const fetchData = async () => {
        let API_URL = "/api/post";//"https://apicr4-main.vercel.app/";
        if (typeof CUSTOM_API_URL !== "undefined") {
            if (isset(CUSTOM_API_URL)) {
                API_URL = CUSTOM_API_URL;
            }
        }else{
            API_URL = API_URL+"?";
        }
        const conId = generateId();
        $ajaxService.setAxiosRun({ "id": conId });
        // eslint-disable-next-line no-underscore-dangle
        const _ut = `${API_URL}&gyu=${ref}&t=${(new Date()).getTime()}`;

        // successcallback(response.data.data);
        var loggedUser = await UnyProtect?.user();
        var loggedEmail = loggedUser?.emailAddresses?.[0]?.emailAddress;
        
        try {
            const response = await axios.post(_ut, { "ref": ref, "body": data },{
                headers: {
                  kenzoemail: loggedEmail, //"demo1@unykloud.com",
                  kenzotoken: PC.getUserConfig("user_token"),
                  projectid: PC.GetParamValue("prid"),
                },
              });
            if (response.data.status === "success") {
                successcallback(response.data.data);
            } else {
                console.error("Ajax Error", response.data)
                if (errorcallback) {
                    errorcallback(response.data);
                }
            }
        } catch (err) {
            console.error("Ajax Error", err)
            if (errorcallback) {
                errorcallback({ "status": "error", "message": "Unexpected Error in local", "error": err });
            }
        } finally {
            $ajaxService.unsetAxiosRun({ "id": conId });
            // setLoading(false); // Hide loader
        }

        // return response.data;
    }
    return fetchData();
}