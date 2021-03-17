<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
          </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table 
        class = "tree-table"
        :data = "catelist" 
        :columns = "columns"
        :selection-type = "false"
        :expand-type = "false"
        :show-row-hover = "false"
        show-index
        index-text="#"
        border>
        <template v-slot:isOk="scope">
          <i class="el-icon-success" v-if = "scope.row.cat_deleted === false" style="color:lightgreen"></i>
          <i class="el-icon-error" v-else style="color:red"></i>
        </template>
        <template v-slot:level = "scope">
          <el-tag v-if = "scope.row.cat_level === 0">一级</el-tag>
          <el-tag v-else-if = "scope.row.cat_level === 1" type="success">二级</el-tag>
          <el-tag v-else type="warning">三级</el-tag>
        </template>
        <template v-slot:option = "scope">
          <el-button type="primary" size="mini" icon = "el-icon-edit" @click="showEditCate(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger" size="mini" icon = "el-icon-delete" @click="deleteCateById(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区 -->
      <el-pagination
        @size-change = "handleSizeChange"
        @current-change = "handleCurrentChange"
        :current-page = "queryInfo.pagenum"
        :page-sizes = "[3, 5, 10, 15]"
        :page-size = "queryInfo.pagesize"
        layout = "sizes,total,prev, pager, next, jumper"
        :total = "total">
      </el-pagination>
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog
      title = "添加分类"
      :visible.sync = "addDialogVisible"
      width = "30%"
      @close="addCateDialogClosed"
      >
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="80px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            v-model="selectKeys"
            :options="parentCateList"
            :props="{ expandTrigger: 'hover', value:'cat_id',label:'cat_name', children:'children', checkStrictly:true }"
            @change="parentCateChange"
            clearable>
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot = "footer" class = "dialog-footer">
        <el-button @click = "addDialogVisible = false">取 消</el-button>
        <el-button type = "primary" @click = "addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改分类的对话框 -->
    <el-dialog
      title = "修改分类"
      :visible.sync = "editDialogVisible"
      width="30%"
      >
      <el-form label-width="80px" :rules = "addCateFormRules" ref="editCateFormRef" :model = "editCateForm">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model = "editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot = "footer" class = "dialog-footer">
        <el-button @click = "editDialogVisible = false">取 消</el-button>
        <el-button type = "primary" @click = "editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data(){
    return {
      // 查询条件参数
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      //获取的分类数据列表
      catelist: [],
      parentCateList: [],
      //级联选择器选中的父级分类id
      selectKeys: [],
      //添加分类的表单数据对象
      addCateForm: {
        //添加的分类名称；父级分类的id；分类的等级默认1级
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      editCateForm: {
        cat_name: ''
      },
      //总数据
      total: 0,
      //table中各列的定义
      columns: [
        {
        label: '分类名称',
        prop: 'cat_name'
        },
        {
        label: '是否有效',
        type: 'template',
        template: 'isOk'
        },
        {
        label: '分级',
        type: 'template',
        template: 'level'
        },
        {
        label: '操作',
        type: 'template',
        template: 'option'
        }
      ],
      addDialogVisible: false,
      editDialogVisible: false,
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur'}
          ]
      },
    }
  },
  created(){
    this.getCateList()
  },
  methods:{
    async getCateList(){
      const {data: res} = await this.$http.get('categories',{params: this.queryInfo})
      if(res.meta.status !== 200){
        return this.$message.error('获取商品分类失败！')
      }
      this.catelist = res.data.result
      this.total = res.data.total
    },
    handleSizeChange(newSize){
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    handleCurrentChange(newPage){
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    showAddCateDialog(){
      this.getParentCateList();
      this.addDialogVisible = true
    },
    //获取父级分类的数据列表
    async getParentCateList(){
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if(res.meta.status !== 200){
        return this.$message.error('获取父级分类数据失败！')
      }
      this.parentCateList = res.data
    },
    //监听选中的父级分类并保存
    parentCateChange(){
      console.log(this.selectKeys)
      if(this.selectKeys.length > 0){
        this.addCateForm.cat_pid = this.selectKeys[ this.selectKeys.length - 1 ]
        this.addCateForm.cat_level = this.selectKeys.length
        return
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    //添加新分类
    addCate(){
      this.$refs.addCateFormRef.validate(async valid => {
        if(!valid) return
        const {data: res} = await this.$http.post('categories', this.addCateForm)
        if(res.meta.status !== 201){
          return this.$message.error('添加分类失败！')
        }
        this.$message.success('添加分类成功！')
        this.getCateList()
        this.addDialogVisible = false
      })
    },
    //关闭对话框重置表单数据
    addCateDialogClosed(){
      this.$refs.addCateFormRef.resetFields()
      this.selectKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    async showEditCate(id){
      const {data: res} = await this.$http.get('categories/' + id)
      if(res.meta.status !== 200){
        return this.$message.error('获取分类数据失败！')
      }
      this.editCateForm = res.data
      this.editDialogVisible = true
    },
    editCate(){
      this.$refs.editCateFormRef.validate(async valid => {
        if(!valid) return
        const {data: res} = await this.$http.put('categories/' + this.editCateForm.cat_id, { cat_name: this.editCateForm.cat_name })
        if(res.meta.status !== 200){
          return this.$message.error('编辑失败！')
        }
        this.$message.success('编辑成功！')
        this.getCateList()
        this.editDialogVisible = false
      })
    },
    async deleteCateById(id){
      const confirmResult = await this.$confirm('此操作将删除该分类，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if(confirmResult != 'confirm'){
        return this.$message.info('已取消删除')
      }
      const {data: res} = await this.$http.delete('categories/' + id)
      if(res.meta.status !== 200){
        return this.$message.error('删除分类失败！')
      }
      this.getCateList()
      this.$message.success('删除该分类成功！')
    }
  }
}
</script>

<style lang="less" scoped>
  .tree-table{
    margin-top: 15px;
  }
  .el-cascader{
    width: 100%;
  }
</style>