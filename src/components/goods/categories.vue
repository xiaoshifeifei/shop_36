<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <div style="margin-top:20px"></div>
    <el-card>
      <el-button style="background-color:#409EFF; color:#fff" @click="cccc">添加分类</el-button>
      <div style="margin-top:20px"></div>
      <!-- 表格 -->
      <tree-table
        class="treeTable"
        :data="catlist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen;"
          ></i>
          <i class="el-icon-error" v-else style="color: red;"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页功能 -->
      <div style="margin-top:20px"></div>

      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[5, 10, 20, 30]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="dialogVisible" width="50%">
      <!-- 验证 -->
      <el-form :model="catelist" :rules="rules" ref="catForm" label-width="100px" @close="init">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="catelist.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- options指定数据源 -->
          <!-- props用来指定配置对象 -->
          <el-cascader
            class="aa"
            expand-trigger="hover"
            :options="options"
            v-model="catval"
            :props="catcat"
            @change="handleChange"
            clearable
            change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="fei">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { cat_api, catadd_api } from '@/Api'

export default {
    data() {
        return {
            // table指定列定义
            columns: [
                {
                    label: '分类名称',
                    prop: 'cat_name'
                },
                {
                    label: '是否有效',
                    // 表示，将当前列定义为模板列
                    type: 'template',
                    // 表示当前这一列使用模板名称
                    template: 'isok'
                },
                {
                    label: '排序',
                    // 表示，将当前列定义为模板列
                    type: 'template',
                    // 表示当前这一列使用模板名称
                    template: 'order'
                },
                {
                    label: '操作',
                    // 表示，将当前列定义为模板列
                    type: 'template',
                    // 表示当前这一列使用模板名称
                    template: 'opt'
                }
            ],
            catlist: [],
            catelist: {
                // 将要添加的分类的名称
                cat_name: '',
                // 父级分类的Id
                cat_pid: 0,
                // 分类的等级，默认要添加的是1级分类
                cat_level: 0
            },
            // 商品数据分类数据
            querInfo: {
                type: 3,
                pagenum: 1,
                pagesize: 5
            },
            // 总页数
            total: 0,
            cat_name: '',
            dialogVisible: false,

            // 验证规则
            rules: {
                cat_name: [
                    {
                        required: true,
                        message: '请输入分类名称',
                        trigger: 'blur'
                    }
                ]
            },
            // 父级数据列表
            options: [],
            // 级联先择器的配置对象
            catcat: {
                value: 'cat_id',
                label: 'cat_name',
                children: 'children'
            },
            // 选中的父级分类的id数组
            catval: []
        }
    },
    created() {
        this.cat()
    },
    methods: {
        handleSizeChange(val) {
            console.log(222)

            this.querInfo.pagesize = val
            this.cat()
        },
        handleCurrentChange(vall) {
            console.log(1111)

            this.querInfo.pagenum = vall
            this.cat()
        },
        async cat() {
            const { data: res } = await cat_api({ params: this.querInfo })
            console.log(res.data, 111111)

            if (res.meta.status !== 200) return this.$message.error('获取失败')
            this.$message.success('获取成功')
            this.catlist = res.data.result
            // 总页数
            this.total = res.data.total
        },
        // 点击添加分类
        cccc() {
            this.getcat()
            this.dialogVisible = true
        },
        init() {
            this.$refs.catForm.resetFields()
        },
        // 获取父级分类的数据列表
        async getcat() {
            const { data: res } = await cat_api({ params: { type: 2 } })
            if (res.meta.status !== 200) {
                return this.$message.error('添加失败')
            }
            this.$message.success('添加成功')
            // console.log(res.data)
            this.options = res.data
        },
        handleChange() {
            console.log(this.catval)
            // 如果父级id的数组长度大于一
            if (this.catval.length > 0) {
                this.catelist.cat_pid = this.catval[this.catval.length - 1]
                this.catelist.cat_level = this.catval.length
                return
            } else {
                this.catelist.cat_pid = 0
                this.catelist.cat_level = 0
            }
        },
        async fei() {
            console.log(this.catelist)
            const { data: res } = await catadd_api(this.catelist)
            if (res.meta.status !== 201) {
                return this.$message.error('获取失败')
            }
            this.$message.success('获取成功')
            this.cat()
            this.dialogVisible = false
        }
    }
}
</script>

<style lang="less" scope>
.aa {
    width: 100%;
}
</style>