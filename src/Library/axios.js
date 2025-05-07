import axios from "axios";
import { baseRoutes } from "./baseRoutes";

const APIrequest = async ({
    method,
    url,
    baseURL,
    queryParams,
    bodyData,
    cancelFunction,
    formHeaders,
    removeHeaders,
    ip,
    token = "",
    clerkId,
}) => {
    const apiToken = token;
    
    try {
        const axiosConfig = {
            method: method || "GET",
            baseURL: "/api",
            headers: {
                "content-type": "application/json",
                "X-Frame-Options": "sameorigin",
            },
        };
        if (clerkId) {
            axiosConfig.headers["x-clerk-id"] = clerkId;
        }
        if (ip) {
            axiosConfig.headers.ip = ip;
        }

        if (formHeaders) {
            axiosConfig.headers = { ...axiosConfig.headers, ...formHeaders };
        }

        if (baseURL) {
            axiosConfig.baseURL = baseURL;
        }

        if (url) {
            axiosConfig.url = url;
        }

        if (queryParams) {
            const queryParamsPayload = {};
            for (const key in queryParams) {
                if (Object.hasOwnProperty.call(queryParams, key)) {
                    let element = queryParams[key];
                    if (typeof element === "string") {
                        element = element.trim();
                    }
                    if (!["", null, undefined, NaN].includes(element)) {
                        queryParamsPayload[key] = element;
                    }
                }
            }
            axiosConfig.params = queryParamsPayload;
        }

        if (bodyData) {
            const bodyPayload = {};
            for (const key in bodyData) {
                if (Object.hasOwnProperty.call(bodyData, key)) {
                    let element = bodyData[key];
                    if (typeof element === "string") {
                        element = element.trim();
                    }
                    if (![null, undefined, NaN].includes(element)) {
                        bodyPayload[key] = element;
                    }
                }
            }
            axiosConfig.data = bodyPayload;
        }

        if (cancelFunction) {
            axiosConfig.cancelToken = new axios.CancelToken((cancel) => {
                cancelFunction(cancel);
            });
        }

        if (removeHeaders) {
            delete axiosConfig.headers;
        }

        if (apiToken) {
            axiosConfig.headers = {
                ...axiosConfig.headers,
                authorization: `Bearer ${apiToken}`,
            };
        }

        const res = await axios(axiosConfig);
        return res.data;
    } catch (error) {
        if (axios.isCancel(error)) {
            console.error("API canceled", error);
        } else {
            const errorRes = error.response;
            console.error("Error in the api request", errorRes);
            if (errorRes && errorRes.status && errorRes.status === 403) {
                console.error(errorRes);
            }
            if (errorRes.data.message) {
                if ([401].includes(errorRes.status)) {
                    removeLocalStorageToken();
                    removeSessionStorageToken();
                    let path =
                        window.location.pathname.search("admin") > 0
                            ? baseRoutes.adminBaseRoutes
                            : baseRoutes.userBaseRoutes;
                    window.location.replace(path);
                    store.dispatch(logout());
                }
            } else {
                console.error(errorRes);
            }
            if (
                "error" in errorRes.data &&
                Object.keys(errorRes.data.error).length &&
                [401].includes(errorRes.data.error.status)
            ) {
                removeSessionStorageToken();
                removeLocalStorageToken();
                let path =
                    window.location.pathname.search("admin") > 0 ? "/siteadmin" : "/";
                window.location.replace(path);
            }
            if (errorRes?.data?.message) {
                console.error(errorRes?.data?.message);
            } else if (errorRes?.data?.error?.length > 0 && errorRes?.data?.error) {
                console.error(errorRes?.data?.error[0]?.message);
            }
            return null;
        }
    }
};

export default APIrequest;