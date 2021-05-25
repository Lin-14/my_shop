<template>
  <div class="login_container">
    <div class="login_box">
      <div class="avator_box">
          <img src="../assets/images/rukawa.png" alt="">
      </div>
      <!-- 登录表单 -->
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" label-width="0px" class="login_form">
        <!-- 用户 -->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" prefix-icon="iconfont icon-3702mima" type="password"></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data(){
    return {
      // 登录表单的数据绑定对象
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 表单的验证规则对象
      loginFormRules: {
        // 验证用户名是否合法
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        // 验证密码是否合法
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 重置表单
    resetLoginForm() {
      this.$refs.loginFormRef.resetFields();
    },
    login() {
      this.$refs.loginFormRef.validate(async valid => {
        // 用async和await简化处理promise
        if(!valid)return;
        const { data: res } = await this.$http.post('login', this.loginForm);
        if(res.meta.status !== 200) return this.$message.error('登录失败！');
        this.$message.success('登录成功！');
        // console.log(res);
        window.sessionStorage.setItem('token', res.data.token);
        this.$router.push('/home');
      });
    }
  }
}
</script>

<style lang="less" scoped>
  .login_container{
    background: url(../assets/images/bgimg.jpg) no-repeat;
    height: 100%;
    width: 100%;
    background-size: 100%;
  }
  .login_box{
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 5px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    .avator_box{
        width: 120px;
        height: 120px;
        border: 1px solid #eee;
        border-radius: 50%;
        padding: 8px;
        box-shadow: 0 0 10px #ddd;
        position: absolute;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #fff;
      img{
          width: 100%;
          height: 100%;
          border-radius: 50%;
      }
    }

    .login_form{
      width: 100%;
      position: absolute;
      bottom: 0;
      padding: 0 35px;
      box-sizing: border-box;
    }
    
    .btns{
      display: flex;
      justify-content: flex-end;
    }
  }
</style>