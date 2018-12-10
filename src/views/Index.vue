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
    async login() {
      self.freeze = true;
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
          self.freeze = false;
        } else if (!token) {
          self.$alert("密码不正确，请重新输入", "登录失败");
          self.freeze = false;
        } else {
          self.$router.push({
            name: "home",
            query: { token, username }
          });
        }
      } catch (err) {
        self.$alert("网络错误，请稍后再试", "登录失败");
        self.freeze = false;
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
.el-container {
  // background-image: url("../assets/img/bg.jpg");
  // background-repeat: no-repeat;
  // background-size: 100% 100%;
  // background-color: red;
  // height: 100%;

  .el-header {
    height: 100% !important;
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
}
</style>

