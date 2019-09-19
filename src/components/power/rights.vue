<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <div style="margin-top :20px"></div>
    <el-table :data="tableData" border stripe style="width: 100%">
      <el-table-column type="index"></el-table-column>
      <el-table-column prop="authName" label="权限名称" width="380"></el-table-column>
      <el-table-column prop="path" label="路径" width="380"></el-table-column>
      <el-table-column prop="level" label="权限等级">
        <!-- 通过插槽自定义其输出格式 -->
        <template slot-scope="scope">
          <!-- 看log输出，字符串就加引号，你是真的菜 -->
          <el-tag v-if="scope.row.level==='0'">一级</el-tag>
          <el-tag v-else-if="scope.row.level==='1'" type="success">二级</el-tag>
          <el-tag v-else type="warning">三级</el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { rights_api } from '@/Api'
import { type } from 'os'
export default {
    data() {
        return {
            tableData: [{ authName: '', level: '', path: '' }]
        }
    },
    created() {
        // 获取所有的用户权限列表
        this.getTableData()
    },
    methods: {
        // 定义一个方法获取数据
        async getTableData() {
            const { data: res } = await rights_api()
            if (res.meta.status !== 200) return this.$message.error('获取错误')
            this.$message.success('获取成功')
            this.tableData = res.data
            console.log(this.tableData)
        }
    }
}
</script>

<style lang="less" scoped>
</style>