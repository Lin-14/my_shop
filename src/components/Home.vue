<template>
  <el-container class = "home-container">
    <!-- 侧边栏区域 -->
    <el-aside :width="isCollapse?'64px':'220px'">
      <el-header>
        <img src="../assets/logo-s.png" alt="">
        <span v-show = "!isCollapse">后台管理系统</span>
      </el-header>
      <!-- 导航区域 -->
      <el-menu 
       background-color = "#304156"
       text-color = "#fff"
       unique-opened
       :collapse = "isCollapse"
       :collapse-transition = "false"
       :router="true"
       :default-active = "activePath"
       >
        <!-- 一级菜单 -->
        <el-submenu :index = "item.id + ' '" v-for = "item in menulist" :key = "item.id">
          <template slot = "title">
            <i :class = "iconObj[item.id]"></i>
            <span>{{item.authName}}</span>
          </template>
          <!-- 二级菜单 -->
          <el-menu-item 
            :index = "'/'+subItem.path" 
            v-for = "subItem in item.children" 
            :key = "subItem.id"
            >
            <template slot = "title">
              <i class = "el-icon-menu"></i>
              <span>{{subItem.authName}}</span>
            </template>
          </el-menu-item>
        </el-submenu>
    </el-menu>
    </el-aside>
    <!-- 右侧区域 -->
    <el-container>
      <el-header>
        <div class = "toggle-button" @click = "toggleCollapse">
          <span :class = "isCollapse?'el-icon-s-unfold':'el-icon-s-fold'"></span>
        </div>
        <el-button type="danger" @click = "logout">退出</el-button>
      </el-header>
      <!-- 主页面区域 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>

</template>

<script>
export default {
  data(){
    return {
      //左侧菜单数据
      menulist: [],
      iconObj: {
        '125': 'iconfont icon-users',
        '103': 'iconfont icon-lock_fill',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      //默认不折叠
      isCollapse: false,
      activePath: ''
    }
  },
  created(){
    this.getMenuList(),
    // this.activePath = window.sessionStorage.getItem('activePath');
    this.activePath = this.$route.path;
  },
  updated() {
    this.activePath = this.$route.path;
  },
  methods: {
    logout(){
      window.sessionStorage.clear();
      this.$router.push('/login');
    },
    //获取左侧菜单数据
    async getMenuList(){
      const { data: res } = await this.$http.get('menus')//menus是请求路径
      if(res.meta.status !== 200 ) return this.$message.error(res.meta.msg);
      this.menulist = res.data;
    },
    //折叠状态取反
    toggleCollapse(){
      this.isCollapse = !this.isCollapse;
    },
  }
}
</script>

<style lang="less" scoped>
  .home-container {
    height: 100%;
  }

  .el-header{
    background-color: #fff;
    display: flex;
    align-items: center;
    font-size: 20px;
    .el-button {
    position: absolute;
    right: 20px;
    }
  }

  .el-aside{
    background-color: #304156;
    transition: all 0.3s;
    .el-header{
      background-color: #304156;
      color: white;
      font-size: 16px;
      span{
      margin-left: 45px;
      position: absolute;
      }
    }
    img{
      height: 34px;
    }
    .el-menu{
      border-right: 0px;
    }
  }

  .el-main{
    background-image: linear-gradient(#fff, #87CEEB) ;
  }

  .iconfont{
    margin-right: 10px;
  }

  .toggle-button{
    cursor: pointer;
    color: #666;
  }
</style>