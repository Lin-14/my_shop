<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialog">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="roleslist" border stripe>
        <el-table-column type="expand">
          <!-- 展开的权限详情 -->
          <template v-slot = "scope">
            <el-row 
              :class="['bdbottom', i1 === 0 ?'bdtop':'','v-center']" 
              v-for="(item1,i1) in scope.row.children" 
              :key="item1.id">
              <!-- 一级权限 -->
              <el-col :span="3">
                <el-tag closable @close="deleteRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级以及三级权限，用两层for循环渲染 -->
              <el-col :span="21">
                <el-row :class="[i2 === 0 ?'':'bdtop','v-center']" v-for="(item2,i2) in item1.children" :key="item2.id">
                  <el-col :span="4">
                    <el-tag type="success" closable @close="deleteRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="20">
                    <el-tag type="warning" closable
                      v-for="(item3) in item2.children" :key="item3.id" 
                      @close="deleteRightById(scope.row,item3.id)"
                      >
                      {{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <el-tooltip content="编辑角色" placement="top" :enterable = "false">
              <el-button type="primary" size="mini" icon="el-icon-edit"
              @click="editRoleDialog(scope.row.id)">编辑</el-button>
            </el-tooltip>
            <el-tooltip content="分配角色权限" placement="top" :enterable = "false">
              <el-button type="warning" size="mini" icon="el-icon-setting" @click="setRightDialog(scope.row)">权限</el-button>
            </el-tooltip>
            <el-tooltip content="删除角色" placement="top" :enterable = "false">
              <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteRoleById(scope.row.id)">删除</el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色的对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRoleDialogVisible" 
      width="30%"
      @close="addRoleDialogClosed">
      <el-form ref="addRoleRef" :model="addRoleForm" :rules="addFormRules" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色的对话框 -->
    <el-dialog
      title="修改角色"
      :visible.sync = "editDialogVisible"
      width="30%"
      @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="30%" @close="setRightDialogClosed">
      <!--tree 树形控件-->
      <el-tree :data="rightslist" :props="treeProps" ref="treeRef" show-checkbox 
        node-key="id" :default-checked-keys="defKeys"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>

</template>

<script>
export default {
  data(){
    return {
      // 对话框默认隐藏
      addRoleDialogVisible: false,
      editDialogVisible: false,
      setRightDialogVisible: false,
      //角色列表数据
      roleslist: [],
      //权限数据
      rightslist: [],
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ]
      },
      editForm: {},
      editFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ]
      },
      //树形结构属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      defKeys: [],
      roleId: ''
    }
  },
  created(){
    this.getRolesList()
  },
  methods:{
    //获取角色列表数据
    async getRolesList(){
      const {data: res} = await this.$http.get('roles')
      if(res.meta.status !== 200){
        return this.$message.error('获取角色列表失败！')
      }
      this.roleslist = res.data
    },
    //添加角色
    addRoleDialog(){
      this.addRoleDialogVisible = true
    },
    addRole(){
      this.$refs.addRoleRef.validate(async valid => {
        if(!valid) return
        const {data: res} = await this.$http.post('roles', this.addRoleForm)
        if(res.meta.status !== 201){
          return this.$message.error('添加角色失败！')
        }
        this.$message.success('添加角色成功！')
        this.addRoleDialogVisible = false
        this.getRolesList()
      })
    },
      addRoleDialogClosed() {
        this.$refs.addRoleRef.resetFields()
      },
    //根据id删除权限
    async deleteRightById(role, rightId){
      const confirmResult = await this.$confirm(
        '此操作将删除该权限，是否继续？',
        '提示',
        {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if(confirmResult !== 'confirm'){
        return this.$message.info('操作已取消')
      }
      const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if(res.meta.status !== 200){
        return this.$message.error('删除权限失败！')
      }
      role.children = res.data
    },
    //展示分配权限对话框，并获取权限数据
    async setRightDialog(role){
      this.roleId = role.id;
      const {data: res} = await this.$http.get('rights/tree')
      if(res.meta.status !== 200){
        return this.$message.error('获取权限数据失败！')
      }
      this.rightslist = res.data
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    //通过递归获取三级权限的id，保存到defKeys数组中
    getLeafKeys(node, arr){
      //不包含children则是三级节点
      if(!node.children){
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    setRightDialogClosed(){
      this.defKeys = []
    },
    //分配权限
    async allotRights(){
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`, {rids: idStr})
      if(res.meta.status !== 200){
        return this.$message.error('分配权限失败！')
      }
      this.$message.success('分配权限成功！')
      this.getRolesList();
      this.setRightDialogVisible = false;
    },
    //修改角色信息
    async editRoleDialog(id){
      const {data: res} = await this.$http.get('roles/'+id)
      if(res.meta.status !== 200){
        return this.$message.error('获取角色信息失败！')
      }
      this.editForm = res.data
      this.editDialogVisible = true;
    },
    editRoleInfo(){
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return
        }
      const {data: res} = await this.$http.put('roles/' + this.editForm.roleId,{ roleName: this.editForm.roleName, roleDesc: this.editForm.roleDesc })
      if(res.meta.status !== 200){
        return this.$message.error('修改角色信息失败！')
      }
      this.$message.success('修改角色信息成功！');
      this.getRolesList();
      this.editDialogVisible = false;
      })
    },
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    //删除角色
    async deleteRoleById(id){
      const confirmResult = await this.$confirm(
        '此操作将删除该角色，是否继续？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if(confirmResult !== 'confirm'){
          return this.$message.info('已取消删除')
        }
        const {data: res} = await this.$http.delete('roles/' + id)
        if(res.meta.status !== 200){
          return this.$message.error('删除角色失败！')
        }
        this.$message.success('删除角色成功！')
        this.getRolesList()
    }
  }
}
</script>

<style lang="less" scoped>
  .el-tag{
    margin: 8px;
  }

  .bdtop{
    border-top: 1px solid #ccc;
  }

  .bdbottom{
    border-bottom: 1px solid #ccc;
  }

  .v-center{
    display: flex;
    align-items: center;
  }
</style>