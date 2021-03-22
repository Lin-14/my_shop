<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter = "20">
        <el-col :span = "8">
          <el-input placeholder="请输入用户ID" v-model = "queryInfo.user_id" @keydown.enter.native = "queryOrderList" clearable @clear = "getOrderList">
            <el-button slot = "append" icon = "el-icon-search" @click = "queryOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单列表区域 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="更新时间" prop = "update_time" width="180px">
          <template v-slot="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="订单编号" prop="order_number" width="160px"></el-table-column>
        <el-table-column label="用户ID" prop="user_id"></el-table-column>
        <el-table-column label="订单价格" prop = "order_price"></el-table-column>
        <el-table-column label="是否付款" v-slot="scope">
          <el-tag type="danger" v-if="scope.row.pay_status==='0'">未付款</el-tag>
          <el-tag type="success" v-else>已付款</el-tag>
        </el-table-column>
        <el-table-column label="是否发货" prop = "is_send"></el-table-column>
        <el-table-column label="收货地址" prop = "consignee_addr" width="280px"></el-table-column>
        <el-table-column label="操作" v-slot="scope" width="180px">
          <el-tooltip effect = "dark" content = "修改订单地址" placement = "top" :enterable = "false">
            <el-button type = "primary" icon = "el-icon-edit" size = "mini" @click="showEditAddr(scope.row)"></el-button>
          </el-tooltip>
          <el-tooltip effect = "dark" content = "物流信息" placement = "top" :enterable = "false">
            <el-button type = "success" icon = "el-icon-location-outline" size = "mini" @click="showProgress(scope.row)"></el-button>
          </el-tooltip>
        </el-table-column>
      </el-table>
      <!-- 修改地址对话框 -->
      <el-dialog title="修改地址" :visible.sync="editAddrVisible" width="40%" @close="addrFormClose">
        <el-form :model="addrForm" :rules="addrFormRules" ref="addrFormRef" label-width="100px">
          <el-form-item label="省市区/县" prop="address1">
            <el-cascader :options="citydata" v-model = "addrForm.address1"
                       :props="{ expandTrigger: 'hover' }"></el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="address2">
            <el-input v-model = "addrForm.address2"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click = "editAddrVisible = false">取 消</el-button>
          <el-button type="primary" @click = "editAddr">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 物流对话框 -->
      <el-dialog title="物流进度" :visible.sync="progressVisible" width="40%">
        <span v-if="this.progress == undefined">暂无物流信息</span>
        <el-timeline>
          <el-timeline-item
            v-for = "(activity, index) in progress"
            :key = "index"
            :timestamp = "activity.time"
            :color = "activity.color"
            >
            {{activity.context}}
          </el-timeline-item>
        </el-timeline>
      </el-dialog>
      <!--  分页区域-->
      <el-pagination
        @size-change = "handleSizeChange"
        @current-change = "handleCurrentChange"
        :current-page = "queryInfo.pagenum"
        :page-sizes = "[6, 8, 10]"
        :page-size = "queryInfo.pagesize"
        layout = "sizes,total,prev, pager, next, jumper"
        :total = "total">
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
// 导入物流信息
import progress from '@/components/order/progress'
import citydata from '@/components/order/citydata';
export default {
  data(){
    return{
      queryInfo:{
        query: '',
        pagenum: 1,
        pagesize: 8,
        user_id: null
      },
      total: 0,
      orderList: [],
      progressVisible: false,
      editAddrVisible: false,
      //物流数据
      progress,
      //地区数据
      citydata,
      addrForm: {
        address1: '',
        address2: '',
        consignee_addr: ''
      },
      addrFormRules: {
        address1: [
          { required: true, message: '请选择省市区/县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请填写详细地址', trigger: 'blur' }
        ]
      },

    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    //获取数据
    async getOrderList(){
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单数据失败')
      } else {
        this.orderList = res.data.goods
        this.total = res.data.total
      }
    },
    //修改地址
    async editAddr(){
      this.addrForm.consignee_addr = this.addrForm.address1 + this.addrForm.address2
      const {data: res} = await this.$http.put('orders/' + this.addrForm.order_id, this.addrForm)
        console.log(res)
        if(res.meta.status !== 201){
          return this.$message.error('修改地址失败！')
        }
        this.$message.success('修改地址成功！');
        this.getOrderList()
        this.editAddrVisible = false
    },
    // 查询订单
    queryOrderList() {
      this.queryInfo.pagenum = 1
      this.getOrderList()
    },
    //修改地址对话框
    showEditAddr(row){
      this.addrForm = row
      this.editAddrVisible = true
    },
    //清空表单数据
    addrFormClose(){
      this.$refs.addrFormRef.resetFields()
    },
    showProgress(row){
      this.progressVisible = true
      this.progress = progress[row.user_id]
    },
    handleSizeChange(newSize){
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    handleCurrentChange(newPage){
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    }
  }
}
</script>

<style lang="less" scoped>
  .el-cascader{
    width: 100%;
  }
</style>