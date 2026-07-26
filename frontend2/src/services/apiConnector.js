import axios from "axios";

const axiosInstance=axios.create({
    baseURL: import.meta.env.VITE_APP_BASE_URL,
    timeout: 20000, // 20s - avoids the UI getting stuck forever (e.g. stuck "Verifying OTP..." toast) if a request never resolves
});

const apiConnector=(url,method,bodyData,header,params)=>{
    
    return axiosInstance({
        url:url,
        method:method,
        data:bodyData?bodyData:null,
        headers:header?header:null,
        params:params?params:null
    })
}

export default apiConnector;