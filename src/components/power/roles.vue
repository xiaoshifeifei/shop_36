<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <div style="margin-top:20px"></div>
    <!-- 卡片 -->
    <el-card>
      <div>
        <el-row>
          <el-button type="primary">添加角色</el-button>
        </el-row>
      </div>
    </el-card>
    <el-dialog title="分配权限" :visible.sync="dialogVisible" width="50%" @close="de">
      <el-tree
        :data="treelist"
        default-expand-all
        :props="treeProps"
        show-checkbox
        node-key="id"
        :default-checked-keys="treearr"
      ></el-tree>
      <span slot="footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <el-table :data="roleslist" border stripe>
      <!-- 扩张栏 -->
      <el-table-column type="expand">
        <template slot-scope="scope">
          <el-row v-for="item1 in scope.row.children" :key="item1.id" class="adadad dddd">
            <!-- 渲染一级权限 -->
            <el-col :span="5">
              <div>
                <el-tag class="tag" closable @close="dele(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <span style="margin-left:15px"></span>
                <i class="el-icon-caret-right"></i>
              </div>
            </el-col>
            <!-- 渲染二级和三级权限 -->
            <el-col :span="19">
              <div>
                <el-row
                  :class="[index === 0? '':'bbbb','dddd']"
                  v-for="(item2,index) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      class="juli"
                      @close="dele(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <span style="margin-left:15px"></span>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      closable
                      v-for="item3 in item2.children"
                      class="julii"
                      :key="item3.id"
                      @close="dele(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </div>
            </el-col>
          </el-row>
          <!-- 分配权限区域 -->
        </template>
      </el-table-column>

      <!-- 索引列 -->
      <el-table-column type="index"></el-table-column>
      <el-table-column label="角色名称" prop="roleName"></el-table-column>
      <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
      <el-table-column label="操作" width="380px">
        <template slot-scope="scope">
          <!-- 修改按钮 -->
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <!-- 删除按钮 -->
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
          <!-- 分配角色按钮 -->
          <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import { roles_api, dele_api, right_api } from '@/Api'
export default {
    data() {
        return {
            // 所有角色数据
            roleslist: [],
            // 所有权限数据
            treelist: [],
            // 显示状态
            dialogVisible: false,
            treeProps: {
                label: 'authName',
                children: 'children'
            },
            // 树状默认勾选的id值
            treearr: []
        }
    },
    created() {
        this.rolesFrom()
    },
    methods: {
        async rolesFrom() {
            const { data: res } = await roles_api()

            this.roleslist = res.data
        },

        async dele(roleld, rightld) {
            const deleResult = await this.$confirm(
                '此操作将永久删除该文件, 是否继续?',
                '提示',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }
            ).catch(err => err)
            if (deleResult !== 'confirm') {
                return this.$message.info('删除失败')
            }
            // 发送请求
            const { data: res } = await dele_api({
                roleid: roleld.id,
                rightld: rightld
            })

            if (res.meta.status !== 200) {
                return this.$message.error('删除失败')
            }
            // 会刷新页面
            // this.rolesFrom()

            roleld.children = res.data
        },
        async showSetRightDialog(role) {
            this.dialogVisible = true
            const { data: res } = await right_api()
            // 在数据打开之前获取到id数据并且渲染出来
            // 调用封装的递归函数

            this.treelist = res.data
            this.rootttlist(role, this.treearr)
            console.log(this.treearr)
        },
        // 树状默认数据获取
        // 利用递归获取数据 保存到treearr数组中
        rootttlist(node, arr) {
            if (!node.children) {
                return arr.push(node.id)
            }
            // 循环遍历数组
            node.children.forEach(item => this.rootttlist(item, arr))
        },

        de() {
            this.treearr = []
        }
    }
}
</script>
<style lang="less" scoped>
.tag {
    margin: 12px 0 12px 0;
}
.adadad {
    border-top: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
    margin: 0 0 -1px 0;
}
.juli {
    margin: 10px 0 10px 0;
}
.bbbb {
    border-top: 1px solid #ccc;
}
.julii {
    margin: 10px 20px 10px 0;
}
.dddd {
    display: flex;
    align-items: center;
}
</style>