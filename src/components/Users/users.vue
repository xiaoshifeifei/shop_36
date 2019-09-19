<template>
  <div>
    <!-- 面包屑导航  -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card class="box-card">
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button @click="getUserList" slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" class="pri" @click="addDialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userlist" border stripe id="aaaaaa">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="alter(scope.row.id)"
            >编辑</el-button>

            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="del(scope.row.id)">删除</el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="rolesslist(scope.row)"
              >分配角色</el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 100]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 分配权限 -->
    <el-dialog title="分配角色" :visible.sync="partVisible" width="50%">
      <p>当前的用户：{{userInfo.username}}</p>
      <p>当前的角色：{{userInfo.role_name}}</p>
      <p>
        分配新角色：
        <el-select v-model="userval" placeholder="请选择">
          <!-- 不要跟着视屏走，内容都不一样
          -->
          <el-option v-for="item in options" :key="item.id" :label="item.roleName" :value="item.id"></el-option>
        </el-select>
      </p>
      <span slot="footer">
        <el-button @click="partVisible = false">取 消</el-button>
        <el-button type="primary" @click="rolesxuan">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加用户的对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="init">
      <!-- 内容主体区 -->
      <el-form :model="ruleForm" :rules="ruleFormRules" ref="ruleFormRef" label-width="100px">
        <el-form-item label="用户名:" prop="username">
          <el-input v-model="ruleForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码:" prop="password">
          <el-input v-model="ruleForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱:" prop="email">
          <el-input v-model="ruleForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机:" prop="mobile">
          <el-input v-model="ruleForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户的对话框 -->
    <el-dialog title="修改用户信息 " :visible.sync="alterDialogVisible" width="50%" @close="initt">
      <el-form :model="alterForm" :rules="alterFormRules" ref="alterFormRef" label-width="100px">
        <el-form-item label="用户名:" prop="username">
          <el-input v-model="alterForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱:" prop="email">
          <el-input v-model="alterForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机:" prop="mobile">
          <el-input v-model="alterForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="alterDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="edit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
    users_api,
    userStateChanged_api,
    addUser_api,
    edit_api,
    result_api,
    delete_api,
    roles_api,
    rolesssss_api
} from '@/Api'
import { longStackSupport } from 'q'
export default {
    data() {
        var checkEmail = (rule, value, cb) => {
            // 验证邮箱的正则表达式
            const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/

            if (regEmail.test(value)) {
                // 合法的邮箱
                return cb()
            }

            cb(new Error('请输入合法的邮箱'))
        }

        // 验证手机号的规则
        var checkMobile = (rule, value, cb) => {
            // 验证手机号的正则表达式
            const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

            if (regMobile.test(value)) {
                return cb()
            }

            cb(new Error('请输入合法的手机号'))
        }
        return {
            // 点击分配权限每一行的数据
            userInfo: {},
            // 渲染下拉菜单
            options: [],
            userval: '',
            // // 下拉框显示于影藏事件
            // visichange: false,
            // 添加用户表单值
            formLabelAlign: {
                name: '',
                region: '',
                type: ''
            },
            // 分配权限显示与影藏
            partVisible: false,
            // 添加用户的表单数据
            ruleForm: {
                username: '',
                password: '',
                email: '',
                mobile: ''
            },
            // 编辑表单的数据
            alterForm: {
                username: '',
                email: '',
                mobile: ''
            },
            // 修改按钮数据
            xiugai: {},
            // 修改用户的对话框
            alterDialogVisible: false,
            // 添加表单的验证规则
            alterFormRules: {
                email: [
                    {
                        required: true,
                        message: '请输入用户名',
                        trigger: 'blur'
                    },
                    { validator: checkEmail, trigger: 'blur' }
                ],
                mobile: [
                    {
                        required: true,
                        message: '请输入手机号',
                        trigger: 'blur'
                    },
                    { validator: checkMobile, trigger: 'blur' }
                ]
            },
            ruleFormRules: {
                username: [
                    {
                        required: true,
                        message: '请输入用户名',
                        trigger: 'blur'
                    },
                    {
                        min: 3,
                        max: 10,
                        message: '用户名的长度在3~10个字符之间',
                        trigger: 'blur'
                    }
                ],
                password: [
                    {
                        required: true,
                        message: '请输入密码',
                        trigger: 'blur'
                    },
                    {
                        min: 3,
                        max: 10,
                        message: '用户名的长度在3~10个字符之间',
                        trigger: 'blur'
                    }
                ],
                email: [
                    {
                        required: true,
                        message: '请输入用户名',
                        trigger: 'blur'
                    },
                    { validator: checkEmail, trigger: 'blur' }
                ],
                mobile: [
                    {
                        required: true,
                        message: '请输入手机号',
                        trigger: 'blur'
                    },
                    { validator: checkMobile, trigger: 'blur' }
                ]
            },
            // 获取用户列表参数对象
            queryInfo: {
                query: '',
                pagenum: 1,
                pagesize: 2
            },
            aa: '',
            userlist: [],
            total: 0,
            // 控制添加用户对话框的显示与隐藏
            addDialogVisible: false
        }
    },
    created() {
        this.getUserList()
    },
    methods: {
        // 分配确定
        async rolesxuan() {
            // 当我点击的时候我要发送请求，将数据发送过去
            const { data: res } = await rolesssss_api(
                this.userInfo,
                this.userval
            )
            if (res.meta.status !== 200) {
                console.log(res)

                return this.$message.error('失败！')
            }
            this.$message.success('分配成功！')
            this.userval = ''
            this.getUserList()
            this.partVisible = false
        },
        // 分配权限
        async rolesslist(userInfo) {
            this.userInfo = userInfo

            const { data: res } = await roles_api()
            if (res.meta.status !== 200) return this.$message.error('失败！')
            this.$message.success('分配成功！')
            this.options = res.data
            console.log(this.options)

            this.partVisible = true
        },
        // 删除单个用户
        async del(idd) {
            const { data: res } = await delete_api({
                id: idd
            })
            if (res.meta.status !== 200)
                return this.$message.error('删除失败！')
            this.$message.success('删除成功！')
            this.getUserList()
        },
        // 添加用户
        addUser() {
            this.$refs.ruleFormRef.validate(async ress => {
                const { data: res } = await addUser_api(this.ruleForm)
                if (res.meta.status != 201)
                    return (
                        this.$message.error('添加用户失败！'),
                        (this.addDialogVisible = true)
                    )
                this.$message.success('添加用户成功！')
                this.addDialogVisible = false
                this.getUserList()
            })
        },
        // 编辑用户
        async edit() {
            const { data: res } = await result_api({
                id: this.alterForm.id,
                email: this.alterForm.email,
                mobile: this.alterForm.mobile
            })
            // console.log(res)
            if (res.meta.status != 200)
                return this.$message.error('修改用户失败！')
            this.$message.success('修改用户成功！')
            // this.alterForm = res.data

            this.alterDialogVisible = false
            this.getUserList()
        },
        // 修改用户
        async alter(idd) {
            const { data: res } = await edit_api({ id: idd })
            if (res.meta.status != 200)
                return this.$message.error('修改用户失败！')
            this.$message.success('修改用户成功！')
            this.alterDialogVisible = true
            this.alterForm = res.data
            // console.log(this.alterForm)
        },
        init() {
            this.$refs.ruleFormRef.resetFields()
        },
        initt() {
            this.$refs.alterFormRef.resetFields()
        },
        // 监听 pagesize 改变的事件
        handleSizeChange(newSize) {
            // console.log(newSize)
            this.queryInfo.pagesize = newSize
            this.getUserList()
        },
        // 监听 页码值 改变的事件
        handleCurrentChange(newPage) {
            // console.log(newPage)
            this.queryInfo.pagenum = newPage
            this.getUserList()
        },
        async getUserList() {
            const { data: res } = await users_api({ params: this.queryInfo })
            // console.log(res)
            if (res.meta.status !== 200) {
                return this.$message.error('获取用户列表失败！')
            } else {
                this.$message.success('登录成功')
            }
            this.userlist = res.data.users
            this.total = res.data.total
        },
        async userStateChanged(userinfo) {
            // console.log(userinfo)

            const { data: res } = await userStateChanged_api({
                uid: userinfo.id,
                type: userinfo.mg_state
            })
            // console.log(res)

            if (res.meta.status !== 200) {
                userinfo.mg_state = !userinfo.mg_state
                return this.$message.error('获取失败！')
            } else {
                this.$message.success('登录成功')
            }
        }
        // 分配角色确定
    }
}
</script>

<style lang="less" scoped>
.box-card {
    margin-top: 10px;
}
.pri {
    margin-left: 20px;
}
#aaaaaa {
    margin-top: 20px;
    margin-bottom: 20px;
}
</style>