<template>
  <el-container>
    <el-header>
      <div class="title">武汉大学信息学部图书馆预约座位</div>
      <div class="title_en">Seat For Wuhan University, Faculty of Information Library</div>
    </el-header>
    <el-main>
      <div class="input_group">
        <el-input v-model="username" placeholder="请输入学号" :disabled="freeze" type="text"></el-input>
        <el-input v-model="password" placeholder="请输入密码" :disabled="freeze" type="password"></el-input>
        <div class="btn_wrapper">
          <el-button type="primary" @click="login" :disabled="freeze">登陆</el-button>
        </div>
      </div>
    </el-main>
    <el-footer>
      <div>Made By Yinting in 南宁大沙田 备案号:1301301300</div>
      <div style="font-style:italic;margin-top:5px">宇宙间最人淡如菊的仙子-周阴婷<i class="yinting"></i></div>
    </el-footer>
  </el-container>
</template>

<script>

let self = null;
export default {
  components: {},
  data() {
    return {
      username: "",
      password: "",

      token: "",
      freeze: false // 输入框、按钮全部disabled
    };
  },

  methods: {
    // 冰冻页面
    getfreeze(){
      self.freeze = true;
      
      return self.$loading({text:'正在登陆...'});
    },

    // 解冻页面
    unfreeze(loadingInstance){
      self.freeze = false;
      self.$nextTick(()=>{
        loadingInstance && loadingInstance.close();
      });
    },

    async login() {
      // self.freeze = true;
      let loading = self.getfreeze();

      let username = self.username || "2016301500173";
      let password = self.password;

      let loginAPI = `/rest/auth?username=${username}&password=${password}`;

      try {
        const res = await self.$http.get(loginAPI);
        const resData = res.data;
        console.log(resData);

        let token = 0;
        if (resData.data != null) {
          token = resData.data.token;
        }

        if (resData.code == "10") {
          self.$alert("系统维护，请稍后再试", "登陆失败");
          // self.freeze = false;
          self.unfreeze(loading);
        } else if (!token) {
          self.$alert("密码不正确，请重新输入", "登录失败");
          self.freeze = false;
          self.unfreeze(loading);
        } else {
          self.$router.push({
            name: "home",
            query: { token, username }
          });
          self.unfreeze(loading);
        }
      } catch (err) {
        self.$alert("网络错误，请稍后再试", "登录失败");
        // self.freeze = false;
        self.unfreeze(loading);
      }

    }
  },

  created() {
    self = this;
  }
};
</script>

<style>
/* html,
body,
#app{
  height: 100%;
  min-height: 600px;
} */
</style>

<style lang="scss" scoped>
.yinting {
  background-image: url("../assets/img/yt.jpg");
  background-size: 100% 100%;
  width: 20px;
  height: 20px;
  display: inline-block;
}
.el-container {
  // background-image: url("../assets/img/bg.jpg");
  // background-repeat: no-repeat;
  // background-size: 100% 100%;
  // background-color: red;
  min-height: 100%;

  .el-header {
    // height: 100% !important;
    height: 100px !important;
    text-align: center;
    .title {
      font-size: 24px;
      margin-top: 20px;
    }
    .title_en {
      font-size: 20px;
    }
  }

  .el-main {
    .input_group {
      width: 200px;
      margin: 30px auto;
    }

    .btn_wrapper {
      text-align: center;
      margin-top: 30px;

      .el-button {
        width: 100%;
      }
    }
  }
  
  .el-footer {
    >* {
      text-align: center;
    }
    color: #8590A6;
    font-size: 13px;

    :first-child{
      font-size:15px;
    };
  }
  
}
</style>

