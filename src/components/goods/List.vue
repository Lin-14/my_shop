<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter = "20">
        <el-col :span = "8">
          <el-input 
            placeholder="请输入内容" 
            v-model = "queryInfo.query"
            clearable
            @keydown.enter.native = "getGoodsList"
            @clear = "getGoodsList"
            >
            <el-button 
              slot = "append" 
              icon = "el-icon-search"
              @click = "getGoodsList"
              ></el-button>
          </el-input>
        </el-col>
        <el-col :span = "4">
          <el-button type = "primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 商品列表区域 -->
      <el-table :data="goodslist" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="价格（元）" prop="goods_price" width = "90px"></el-table-column>
        <el-table-column label="商品数量" prop="goods_number" width = "80px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width = "80px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width = "150px">
          <template v-slot="scope">
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width = "180px" v-slot="scope">
          <el-button @click = "getGoodDetail(scope.row.goods_id)" type = "primary" icon = "el-icon-search" size = "mini">图片</el-button>
          <el-button @click = "deleteGoodsById(scope.row.goods_id)" type = "danger" icon = "el-icon-delete" size = "mini">删除</el-button>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
       <el-pagination
        @size-change = "handleSizeChange"
        @current-change = "handleCurrentChange"
        :current-page = "queryInfo.pagenum"
        :page-sizes = "[4, 6, 8, 10]"
        :page-size = "queryInfo.pagesize"
        layout ="total, sizes, prev, pager, next, jumper"
        :total = "total">
      </el-pagination>
    </el-card>
    <el-image-viewer
      v-if="showViewer"
      :on-close="()=>{showViewer=false}"
      :url-list="imgList"
      />
  </div>
</template>

<script>
import ElImageViewer from 'element-ui/packages/image/src/image-viewer'
export default {
  components:{ElImageViewer},
  data(){
    return {
      queryInfo: {
        query: '',
        // 当前页码
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 8
      },
      goodslist: [],
      total: 0,
      goodId: null,
      showViewer: false,
      imgList: []
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表数据失败')
      } else {
        this.goodslist = res.data.goods
        this.total = res.data.total
      }
    },
    //test获取商品图片
    async getGoodDetail(id) {
      this.goodId = id
      const { data: res } = await this.$http.get('goods/' + this.goodId)
      if (res.meta.status !== 200) {
        return this.$message.error('获取数据失败')
      } else {
        let picsList = []
        for(let item of res.data.pics){
          picsList.push(item.pics_big)
        }
        this.imgList = picsList
        console.log(this.goodId);
      }
      this.showViewer = true
    },
    handleSizeChange(newSize){
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    handleCurrentChange(newPage){
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    //根据商品的id删除对应商品
    async deleteGoodsById(id){
      const confirmResult = await this.$confirm('此操作将永久删除该商品，是否继续？','提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if(confirmResult !== 'confirm'){
        return this.$message.info('已取消删除')
      }
      const {data: res} = await this.$http.delete('goods/' + id)
      if(res.meta.status !== 200){
        return this.$message.error('删除商品失败！')
      }else{
        this.$message.success('删除商品成功！')
        this.getGoodsList()
      }
    },
    goAddPage(){
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style lang="less" scoped>

</style>