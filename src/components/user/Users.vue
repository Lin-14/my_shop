<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <!-- 搜索与添加区域 -->
      <el-row :gutter = "20">
        <el-col :span = "8">
          <el-input 
            placeholder="请输入内容" 
            v-model = "queryInfo.query"
            clearable
            @clear = "getUserList"
            >
            <el-button 
              slot = "append" 
              icon = "el-icon-search"
              @click = "getUserList"
              ></el-button>
          </el-input>
        </el-col>
        <el-col :span = "4">
          <el-button type = "primary" @click="dialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userlist" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态" v-slot="scope">
          <!-- 插槽直接用于组件，{{scope.row}} 每一行均为一个用户对象 -->
          <el-switch 
            v-model="scope.row.mg_state" 
            @change="userStateChange(scope.row)"
            ></el-switch>
        </el-table-column>
        <el-table-column label="操作" v-slot = "scope" width="220px">
          <el-tooltip content="编辑用户" placement="top" :enterable = "false">
            <el-button type="primary" icon="el-icon-edit" size = "mini" 
              @click="showEditDialog(scope.row.id)"></el-button>
          </el-tooltip>
          <el-tooltip content="分配角色" placement="top" :enterable = "false">
            <el-button type="warning" icon="el-icon-setting" size = "mini" @click="setRole(scope.row)"></el-button>
          </el-tooltip>
          <el-tooltip content="删除用户" placement="top" :enterable = "false">
            <el-button type="danger" icon="el-icon-delete" size = "mini"
              @click="deleteUserById(scope.row.id)"></el-button>
          </el-tooltip>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change = "handleSizeChange"
        @current-change = "handleCurrentChange"
        :current-page = "queryInfo.pagenum"
        :page-sizes = "[2, 4, 6, 8]"
        :page-size = "queryInfo.pagesize"
        layout = "total, sizes, prev, pager, next, jumper"
        :total = "total">
      </el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog
      title = "添加用户"
      :visible.sync = "dialogVisible"
      width = "30%"
      @close = "addDialogClosed"
      >
      <el-form :model = "addForm" :rules = "addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户信息对话框 -->
    <el-dialog
      title = "修改用户信息"
      :visible.sync = "editDialogVisable"
      width = "30%"
      @closed = "editDialogClosed"
      >
      <el-form :model = "editForm" :rules = "editFormRules" ref = "editFormRef" label-width = "70px">
        <el-form-item label = "用户名">
          <el-input v-model = "editForm.username" :disabled = "true"></el-input>
        </el-form-item>
        <el-form-item label = "邮箱" prop = "email">
          <el-input v-model = "editForm.email"></el-input>
        </el-form-item>
        <el-form-item label = "电话" prop = "mobile">
          <el-input v-model = "editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot = "footer" class = "dialog-footer">
        <el-button @click = "editDialogVisable = false">取 消</el-button>
        <el-button type = "primary" @click = "editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配用户角色对话框 -->
    <el-dialog
      title = "分配角色"
      :visible.sync = "setRoleDialogVisable"
      width = "30%"
      @close = "setRoleDialogClosed"
      >
      <div>
        <p>当前用户：{{userInfo.username}}</p>
        <p>当前角色：{{userInfo.role_name}}</p>
        <p>分配角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot = "footer" class = "dialog-footer">
        <el-button @click = "setRoleDialogVisable = false">取 消</el-button>
        <el-button type = "primary" @click = "saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data(){
    // 验证邮箱的校验规则
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
      if (regEmail.test(value)) {
        return callback()
      }
      callback(new Error('请输入合法的邮箱'))
    }
    // 验证手机号的校验规则
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^(13[0-9]|14[01456879]|15[0-3,5-9]|16[2567]|17[0-8]|18[0-9]|19[0-3,5-9])\d{8}$/
      if (regMobile.test(value)) {
        return callback()
      }
      callback(new Error('请输入合法的手机号'))
    }
    return{
      //用户列表的参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 6
      },
      userlist: [],
      total: 0,
      dialogVisible: false,
      //添加用户的表单数据和规则
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名长度在3~10个字符之间', trigger: 'blur'}
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '密码长度在6~15个字符之间', trigger: 'blur'}
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      editDialogVisable: false,
      // 查询到的用户数据和验证规则
      editForm: {},
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入用户手机', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      setRoleDialogVisable: false,
      //需要被分配角色的用户信息
      userInfo: [],
      //所有角色列表
      rolesList: [],
      //选中的角色
      selectedRoleId: ''
    }
  },
  created(){
    this.getUserList()
  },
  methods:{
    //获取用户列表
    async getUserList(){
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if(res.meta.status !== 200){
        return this.$message.error('获取用户列表失败！')
      }else{
        this.userlist = res.data.users;
        this.total = res.data.total;
        // console.log(res)
      } 
    },
    //监听pagesize和page的改变
    handleSizeChange(newSize){
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    handleCurrentChange(newPage){
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    //监听开关状态，修改用户状态
    async userStateChange(userInfo){
      const {data: res} = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
        if(res.meta.status !== 200){
          userInfo.mg_state = !userInfo.mg_state;
          return this.$message.error('更新用户状态失败！')
        }
        this.$message.success('更新用户状态成功！')
    },
    //监听添加用户对话框关闭后重置表单
    addDialogClosed(){
      this.$refs.addFormRef.resetFields()
    },
    //点击按钮添加用户
    addUser(){
      this.$refs.addFormRef.validate(async valid => {
        if(!valid) return
        //发起添加用户的网络请求
        const {data: res} = await this.$http.post('users', this.addForm)
        if(res.meta.status !== 201){
          this.$message.error('添加用户失败！')
        }
        this.$message.success('添加用户成功！')
        this.dialogVisible = false;
        this.getUserList();
      })
    },
    //点击修改用户信息
    async showEditDialog(id){
      console.log(id)
      const {data: res} = await this.$http.get('users/' + id)
      if(res.meta.status !== 200){
        return this.$message.error('查询用户信息失败！')
      }
      this.editForm = res.data
      this.editDialogVisable = true
    },
    //监听修改用户对话框关闭后重置表单
    editDialogClosed(){
      this.$refs.editFormRef.resetFields()
    },
    //点击按钮发起修改信息的请求
    editUserInfo(){
      this.$refs.editFormRef.validate(async valid => {
        if(!valid) return
        const {data: res} = await this.$http.put('users/' + this.editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        if(res.meta.status !== 200){
          return this.$message.error('更新用户信息失败！')
          }
        this.editDialogVisable = false;
        this.getUserList();
        this.$message.success('更新用户信息成功！');
      })
    },
    //根据用户Id删除对应用户
    async deleteUserById(id){
       const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => {
        return err
      })
      // 确认删除，则返回字符串 confirm，取消删除，则返回字符串 cancle（用catch捕获）
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败')
      } else {
        this.$message.success('删除用户成功')
        this.getUserList()
      }
    },
    async setRole(userInfo){
      this.userInfo = userInfo
      //获取所有角色列表
      const {data: res} = await this.$http.get('roles')
      if(res.meta.status !== 200){
        return this.$message.error('获取角色列表失败！')
      }
      this.rolesList = res.data
      this.setRoleDialogVisable = true;
    },
    //确定按钮分配角色
    async saveRoleInfo(){
      if(!this.selectedRoleId){
        return this.$message.error('请选择要分配的角色！')
      }
      const {data: res} = await this.$http.put(`users/${this.userInfo.id}/role`,{rid: this.selectedRoleId})
      if(res.meta.status !== 200){
        return this.$message.error('更新角色失败！')
      }
      this.$message.success('更新角色成功！')
      this.getUserList();
      this.setRoleDialogVisable = false;
    },
    setRoleDialogClosed(){
      this.selectedRoleId = '',
      this.userInfo = ''
    }
  }
}
</script>

<style lang="less" scoped>

</style>