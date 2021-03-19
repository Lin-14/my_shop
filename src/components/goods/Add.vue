<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert type="info" show-icon :closable="false" center
        title="添加商品信息">
      </el-alert>
      <!-- 步骤条 -->
      <el-steps :active="activeIndex - 0" align-center finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 表单和tab标签 -->
      <el-form :model = "addForm" :rules = "addFormRules" ref="addFormRef" label-position = "top">
        <el-tabs tab-position="left" v-model = "activeIndex" :before-leave = "beforeTabLeave" @tab-click = "tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model = "addForm.goods_cat"
                :options = "cateList"
                :props = "{ expandTrigger: 'hover', label: 'cat_name', value: 'cat_id', children: 'children'}"
                @change = "handleChange"
                clearable>
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的Item项 -->
            <el-form-item :label = "item.attr_name" v-for = "item in manyTableData" :key = "item.attr_id">
              <el-checkbox-group v-model = "item.attr_vals">
                <el-checkbox :label = "cb" v-for = "(cb,i) in item.attr_vals" :key = "i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label = "item.attr_name" v-for = "item in onlyTableData" :key = "item.attr_id">
              <el-input v-model = "item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action = "uploadURL"
              :on-preview = "handlePreview"
              :on-success = "handleSuccess"
              :on-remove = "handleRemove"
              list-type = "picture-card"
              :headers = "headerObj">
              <i class = "el-icon-plus"></i>
            </el-upload>
            <!-- 图片预览窗口 -->
            <el-dialog title="图片预览" :visible.sync = "previewVisible" width="50%">
              <img width = "100%" :src = "previewPath">
            </el-dialog>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!--富文本编辑器组件-->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!--添加商品按钮-->
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  data(){
    return{
      activeIndex: '0',
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      // 商品分类列表
      cateList: [],
      // 动态参数列表
      manyTableData: [],
      onlyTableData: [],
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传组件的headers 请求头
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      previewVisible: false,
      previewPath: ''
    }
  },
  created(){
    this.getCateList()
  },
  methods:{
    async getCateList(){
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败')
      }
      this.cateList = res.data
    },
    //级联选择器选中项变化
    handleChange(){
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    //标签页切换
    beforeTabLeave(){
      let flag = false
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          this.$message.error('请填写完整的商品基本信息')
        } else {
          flag = true
        }
      })
      return flag
    },
    async tabClicked(){
      //动态参数面板
      if(this.activeIndex === '1'){
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败')
        }
        console.log(res.data)
        // 将返回数据中的字符串 attr_vals 分割得到数组，给多选框使用
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
      }else if(this.activeIndex === '2'){
        //静态属性面板
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`,
          { params: { sel: 'only' } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取静态属性失败')
        }
        // console.log(res.data)
        this.onlyTableData = res.data
      }
    },
    //处理图片预览效果
    handlePreview(file){
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    //图片上传成功的事件
    handleSuccess(response){
      const picInfo = { pic: response.data.tmp_path }
      this.addForm.pics.push(picInfo)
      console.log(this.addForm.pics)
    },
    //处理删除图片
    handleRemove(file){
      console.log(file)
      const filePath = file.response.data.tmp_path
      const i = this.addForm.pics.findIndex(x => x.pic === filePath)
      this.addForm.pics.splice(i, 1)
      console.log(this.addForm)
    },
    //添加商品
    add(){
      this.$refs.addFormRef.validate(async valid => {
        if(!valid){
          return this.$message.error('请填写必要的表单项')
        }
        //执行添加的业务逻辑
        //级联选择器绑定了同一个addForm，深拷贝addForm对象处理此问题
        const form = JSON.parse( JSON.stringify(this.addForm) );
        form.goods_cat = form.goods_cat.join(',')
        //处理参数和属性
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        this.onlyTableData.forEach(item => {
          const newInfo = { 
            attr_id: item.attr_id, 
            attr_value: item.attr_vals }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        console.log(form)
        //  发起请求
        //  商品的名称，必须是唯一的
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败！')
        }
        this.$message.success('添加商品成功！')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
  .el-alert{
    letter-spacing: 5px;
    margin-bottom: 18px;
  }
  .el-tabs{
    margin-top: 20px;
  }
  .el-form-item{
    margin-bottom: 20px;
  }
  .el-input{
    width: 50%;
  }
  .el-checkbox {
    margin: 0 10px 10px 0 !important;
  }
  .btnAdd{
    margin-top: 15px;
  }
</style>