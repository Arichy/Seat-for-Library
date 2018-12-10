import axios from 'axios';
import libraryConfig from "@/assets/js/library.config.js";
import { stringify } from 'qs';

axios.defaults.baseURL = libraryConfig.host;

axios.interceptors.request.use(function (config) {
    if (config.headers['Content-Type'] == undefined) {//将默认的content-type设置为application/x-www-form-urlencoded
        config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    }

    if (config.headers['Content-Type'] == 'application/x-www-form-urlencoded') {
        config.data = stringify(config.data);
    }

    return config;
}, function (error) {
    return Promise.reject(error);
});

export default axios;
