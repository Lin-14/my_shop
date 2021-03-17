<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-alert type="warning" show-icon :closable="false" center
        title="注意：只允许为第三级分类设置相关参数！">
      </el-alert>
      <el-row class="">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 级联选择框 -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="catelist"
            :props="{ expandTrigger: 'hover', value:'cat_id',label:'cat_name', children:'children' }"
            @change="handleChange"
            clearable>
          </el-cascader>
        </el-col>
      </el-row>
      <!-- tab标签页区域 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" @click="showDialog" :disabled="isBtnDisabled">添加参数</el-button>
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand" v-slot="scope">
              <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
              <!-- 输入文本框 -->
              <el-input
                class="input-new-tag"
                v-if="scope.row.inputVisible"
                v-model="scope.row.inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(scope.row)"
                @blur="handleInputConfirm(scope.row)"
              >
              </el-input>
              <!-- 添加标签按钮 -->
              <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" @click="showDialog" :disabled="isBtnDisabled">添加属性</el-button>
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand" v-slot="scope">
              <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
              <!-- 输入文本框 -->
              <el-input
                class="input-new-tag"
                v-if="scope.row.inputVisible"
                v-model="scope.row.inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(scope.row)"
                @blur="handleInputConfirm(scope.row)"
              >
              </el-input>
              <!-- 添加标签按钮 -->
              <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
      <!-- 添加参数和属性的对话框 -->
      <el-dialog
        :title="'添加'+titleText"
        :visible.sync="addDialogVisible"
        width="30%"
        @close="addDialogClosed">
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addParams">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改参数和属性的对话框 -->
      <el-dialog
        :title="'修改'+titleText"
        :visible.sync="editDialogVisible"
        width="30%"
        @close="editDialogClosed">
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editParams">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data(){
    return{
      catelist: [],
      //级联选择框双向绑定的数组
      selectedCateKeys: [],
      activeName: 'many',
      manyTableData: [],
      onlyTableData: [],
      addDialogVisible: false,
      editDialogVisible: false,
      //添加/修改的表单数据对象
      addForm: {
        attr_name: ''
      },
      editForm: {
        attr_name: ''
      },
      //添加/修改表单的数据验证规则
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入名称', trigger: 'blur'}
        ]
      },
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入名称', trigger: 'blur'}
        ]
      }
    }
  },
  created(){
    this.getCateList()
  },
  methods: {
    async getCateList(){
      const {data: res} = await this.$http.get('categories')
      if(res.meta.status !== 200){
        return this.$message.error('获取商品分类失败！')
      }
      this.catelist = res.data
      console.log(this.catelist)
    },
    //获取分类参数的数据
    async getParamsData(){
      if(this.selectedCateKeys.length !== 3){
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return this.$message.warning('请选择第三级分类！')
      }
      //根据id和参数获取对应的数据
      const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, { params: {sel: this.activeName} })
      if(res.meta.status !== 200){
        return this.$message.error('获取参数列表失败！')
      }
      //对数据进行分割成数组（数据不为空才处理）
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制文本框的隐藏
        item.inputVisible = false
        // 文本框中输入的值
        item.inputValue = ''
      })
      
      console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    //监听级联选中项变化
    async handleChange(){
      this.getParamsData()
    },
    //监听tab标签页切换
    handleClick(){
      this.getParamsData()
      // console.log(this.activeName);
    },
    showDialog(){
      this.addDialogVisible = true
    },
    //修改参数或属性对话框
    async showEditDialog(attrId){
      const {data: res} = await this.$http.get(
        `categories/${this.cateId}/attributes/${attrId}`,
        { params: { attr_sel: this.activeName } }
        )
      if (res.meta.status !== 200) {
        return this.$message.error(`查询该${this.titleText}失败！`)
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    //添加参数或属性
    addParams(){
      this.$refs.addFormRef.validate(async valid => {
        if(!valid) return
        const {data: res} = await this.$http.post(`categories/${this.cateId}/attributes`,
        {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if(res.meta.status !== 201){
          return this.message.error(`添加${this.titleText}失败！`)
        }
        this.$message.success(`添加${this.titleText}成功！`)
        this.addDialogVisible = false
        this.getParamsData()
      })
    },
    //发起修改请求
    editParams(){
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          })
        if (res.meta.status !== 200) {
          return this.$message.error(`编辑该${this.titleText}失败！`)
        }
        this.$message.success(`编辑该${this.titleText}成功！`)
        this.getParamsData()
        this.editDialogVisible = false
      })
    },
    //根据id删除对应参数
    async deleteParams(attrId){
      const confirmResult = await this.$confirm(`将要删除该${this.titleText}，是否继续？`, '提示',{
        confirmButton: '确定',
        cancelButton: '取消',
        type: 'warning'
      }).catch(err => err)
      if(confirmResult !== 'confirm'){
        return this.$message.info('已取消删除')
      }
      const {data: res} = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)
      if(res.meta.status !== 200){
         return this.$message.error(`删除该${this.titleText}失败！`)
      }
      this.$message.success(`删除该${this.titleText}成功`)
      this.getParamsData()
    },
    addDialogClosed(){
      this.$refs.addFormRef.resetFields()
    },
    editDialogClosed(){
      this.$refs.editFormRef.resetFields()
    },
    async handleInputConfirm(row){
      row.inputValue = row.inputValue.trim()
      if(row.inputValue.length === 0){
        row.inputValue = ''
        row.inputVisible = false
        return
      }else{
      row.attr_vals.push(row.inputValue)
      row.inputValue = ''
      row.inputVisible = false}
      //需要发起请求保存这次操作
      this.saveAttrVals(row)
    },
    //输入文本框的显示
    showInput(row){
      row.inputVisible = true
      //文本框自动获得焦点
      // $nextTick 当页面上的元素被重新渲染完毕之后（Input框出现后），才会执行回调函数中的代码
      this.$nextTick( () => {
          this.$refs.saveTagInput.$refs.input.focus()
        })
    },
    //将对attr_vals的操作保存到数据库
    async saveAttrVals(row){
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: this.activeName,
          attr_vals: row.attr_vals.join(' ')
        })
      if (res.meta.status !== 200) {
        return this.$message.error('修改该标签失败！')
      }
      this.$message.success('修改该标签成功！')
    },
    handleClose(i, row){
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  },
  computed:{
    isBtnDisabled(){
      if(this.selectedCateKeys.length !== 3){
        return true
      }
      return false
    },
    cateId(){
      if(this.selectedCateKeys.length === 3){
        return this.selectedCateKeys[2]
      }
      return null
    },
    titleText(){
      return this.activeName === 'many' ? '动态参数' : '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
  .el-alert{
    letter-spacing: 5px;
    margin-bottom: 18px;
  }
  .el-cascader{
    width: 300px;
  }
  .el-tag{
    margin: 5px;
  }

  .input-new-tag {
    width: 120px;
    margin-left: 10px;
  }
</style>