import axios from 'axios'
// 配置请求的跟路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config => {
    config.headers.Authorization = window.sessionStorage.getItem('token')
    return config
})

// 登录接口
export const login_api = params => {
    return axios.post('login', params)
}

// 获取home的导航菜单
export const menus_api = () => {
        return axios.get('menus')
    }
    // 用户列表
export const users_api = params => {
        return axios.get('users', params)
    }
    // 监听开关
export const userStateChanged_api = params => {

    return axios.put(`users/${params.uid}/state/${params.type}`)
}

export const addUser_api = (params) => {
        return axios.post('users', params)
    }
    // 编辑用户信息
export const edit_api = (params) => {
        return axios.get(`users/${params.id}`)
    }
    // 编辑用户提交
export const result_api = (params) => {
    return axios.put(`users/${params.id}`, { email: params.email, mobile: params.mobile })
}

// 删除单个用户
export const delete_api = (params) => {
    console.log(params, 111111);

    return axios.delete(`users/${params.id}`)
}