import axios from "axios";

export const isset = (v) => {
    if (typeof v != "undefined") {
        return true
    } else {
        return false;
    }
}


export const generateId = (len) => {
    let maxlen = 9;
    if (len) {
        maxlen = len;
    }
    return Math.random().toString(36).substr(2, maxlen);
}

class ajaxService {
    activeAxios = [];
    onChange = () => {};
  
    setOnChangeCallback = (callback) => {
      this.onChange = callback;  // Allow React component to set a callback
    };
  
    setAxiosRun = (con) => {
      this.activeAxios.push(con);
      this.onChange([...this.activeAxios]);  // Notify React about the change
    };
  
    unsetAxiosRun = (con) => {
      this.activeAxios = this.activeAxios.filter(
        (axiosInstance) => axiosInstance.id !== con.id
      );
      this.onChange([...this.activeAxios]);  // Notify React about the change
    };
  }

export const $ajaxService = new ajaxService();

// eslint-disable-next-line camelcase
export const $ajax_post = (ref, data, successcallback, errorcallback, options) => {
    // const { setLoading } = useLoading();

    // axios.post();    
    const fetchData = async (len) => {
        let API_URL = "/api";//"https://apicr4-main.vercel.app/";
        if (typeof CUSTOM_API_URL !== "undefined") {
            if (isset(CUSTOM_API_URL)) {
                API_URL = CUSTOM_API_URL;
            }
        }else{
            API_URL = API_URL;
        }
        const conId = generateId();
        $ajaxService.setAxiosRun({ "id": conId });
        // eslint-disable-next-line no-underscore-dangle
        const _ut = `${API_URL}/${ref}`;

        // successcallback(response.data.data);

        try {
            const response = await axios.post(_ut, { "ref": ref, "body": data, "len":len });
            console.log('ajjjjssss',response)
            if (response.data.status === "success") {

                successcallback(response.data.data);
            } else {
                console.error("Ajax Erroreee", response)
                if (errorcallback) {
                    errorcallback(response.message);
                }
            }
        } catch (err) {
            if (errorcallback) {
                console.log('err',err?.response?.data?.message)
                errorcallback({ "status": "error", "message": err?.response?.data?.message, "error": err });
            }
        } finally {
            $ajaxService.unsetAxiosRun({ "id": conId });
            // setLoading(false); // Hide loader
        }

        // return response.data;
    }
    if(options && options?.list){
        fetchData(50);
        return fetchData();
    }else{
        return fetchData();
    }
}

export const $ajax_file = (ref, body, successcallback, errorcallback) => {
    const uploadFile = async () => {
        const file = body.file;
        let API_URL = "/api/upload"; // ✅ Use the correct endpoint for file uploads

        if (typeof CUSTOM_API_URL !== "undefined") {
            if (isset(CUSTOM_API_URL)) {
                API_URL = CUSTOM_API_URL;
            }
        } else {
            API_URL = API_URL + "?";
        }

        const conId = generateId();
        $ajaxService.setAxiosRun({ "id": conId });

        // ✅ Ensure the file is a valid File object
        if (!(file instanceof File)) {
            console.error("Invalid file provided.");
            if (errorcallback) {
                errorcallback({ status: "error", message: "Invalid file" });
            }
            return;
        }

        // ✅ Prepare FormData properly
        const formData = new FormData();
        formData.append("file", file, file.name); // ✅ Append file correctly
        // formData.append("filedata", JSON.stringify(body?.data));
        formData.append("ref", ref);

        // ✅ Debugging: Log FormData content
        for (let pair of formData.entries()) {
            console.log("FormData:", pair[0], pair[1]);
        }

        let params = [];

        if(body?.data){
            for (let key in body?.data) {
                params.push(key+"="+body?.data?.[key]);
            }
        }

        // ✅ Construct URL with parameters
        let _ut = `${API_URL}&gyu=${ref}&t=${Date.now()}`;

        if(params.length > 0){
            _ut += "&"+params.join("&");
        }
        
        try {
            const response = await fetch(_ut, {
                method: "POST",
                body: formData, // ✅ Sends FormData directly
            });

            const result = await response.json();

            if (result.status === "success") {
                successcallback(result.data);
            } else {
                console.error("File Upload Error", result);
                if (errorcallback) {
                    errorcallback(result);
                }
            }
        } catch (err) {
            console.error("File Upload Error", err);
            if (errorcallback) {
                errorcallback({ status: "error", message: "Unexpected Error", error: err });
            }
        } finally {
            $ajaxService.unsetAxiosRun({ "id": conId });
        }
    };

    return uploadFile();
};
