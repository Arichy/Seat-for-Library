<template>
  <div class="home">
    <el-container>
      <el-header>
        <div class="header">
          <div
            class="success_info"
          >登陆成功，当前用户:{{$route.query.username=='2016301500173'?'尊贵的钻石VIP-Arichy':$route.query.username}}</div>
        </div>
      </el-header>

      <el-main>
        <div class="current_reservation">
          <div>当前预约：{{currentReservationStr || '无'}}</div>
          <el-button
            type="primary"
            style="margin-top:20px;"
            :disabled="currentReservationObj==null || freeze?true:false"
            @click="delayCurrentReservation_handler"
          >延迟当前预约（半小时）</el-button>
          <el-button
            type="danger"
            :disabled="currentReservationObj==null || freeze?true:false"
            @click="cancelCurrentReservation_handler"
          >取消当前预约</el-button>
        </div>

        <div class="reservation_part">
          <div class="room_table">
            <el-table :data="roomArr" border size="mini">
              <el-table-column prop="id" label="房间号"></el-table-column>
              <el-table-column prop="name" label="房间名"></el-table-column>
            </el-table>
          </div>

          <div class="reservation_data">
            <el-row>
              <el-col :span="12">请输入房间号:
                <el-input
                  :placeholder="roomIdHint"
                  :disabled="freeze"
                  v-model.trim.number="roomId"
                  maxlength="2"
                  @input="getSeatTotalNumber"
                ></el-input>
              </el-col>
              <el-col :span="12">请输入座位号:
                <el-input
                  :placeholder="seatNumHint"
                  :disabled="freeze"
                  v-model.trim.number="seatNum"
                  maxlength="3"
                ></el-input>
              </el-col>
            </el-row>
            <el-row style="margin-top:20px;">
              <el-col>开始时间:
                <el-select v-model="startTime" placeholder="请选择开始时间" :disabled="freeze">
                  <el-option
                    v-for="(startTime,index) of startTimeArr"
                    :key="index"
                    :label="startTime"
                    :value="startTime"
                  ></el-option>
                </el-select>
              </el-col>
              <el-col style="margin-top:20px">结束时间:
                <el-select v-model="endTime" placeholder="请选择结束时间" :disabled="freeze">
                  <el-option
                    v-for="(endTime,index) of endTimeArr"
                    :key="index"
                    :label="endTime"
                    :value="endTime"
                  ></el-option>
                </el-select>
              </el-col>
            </el-row>
          </div>

          <div class="reserve_btn_group">
            <el-button type="success" :disabled="freeze" @click="reserveToday_handler">预约今天</el-button>
            <br>
            <el-button type="primary" :disabled="freeze" @click="reserveTomorrow">预约明天</el-button>
            <br>
            <el-button
              type="danger"
              :disabled="freeze && !timeCheckTimer"
              @click="cancelReserveTomorrow"
            >取消预约明天</el-button>
          </div>

          <div class="console">
            <div>&nbsp;{{status}}</div>
            <div>控制台信息:{{consoleInfo}}</div>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import libraryConfig from "@/assets/js/library.config.js";
import { setInterval, clearInterval, clearImmediate } from "timers";

let self = null;
let token = "";

// 禁止预约的座位
let black_seatArr = [];
for (let i = 1; i <= 92; i++) {
  black_seatArr.push(["3", i.toString().padStart(3, "0")]);
}

function checkSeat(room, seatNum) {
  for (const black_seat of black_seatArr) {
    if (room == black_seat[0] && seatNum == black_seat[1]) {
      return false;
    }
  }

  return true;
}
// 每个房间的座位数量
// let roomSeatTotalNumber = {};

const seatMap = new Map();

// 返回年-月-日字符串，mode=2时返回明天的字符串
function getDate(mode) {
  let date = new Date();
  if (mode == 2) {
    date.setTime(date.getTime() + 24 * 60 * 60 * 1000);
  }
  let year = date.getFullYear();
  let month = date.getMonth() + 1 + "";
  let day = date.getDate() + "";

  date = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

  return date;
}

// 去掉字符串中的所有空白字符
function trim(str) {
  return str.replace(/\s+/g, "");
}

export default {
  data() {
    return {
      freeze: false, // 控制页面的所有input，在点击按钮之后全部禁用，直到请求返回再解除禁用
      currentReservationStr: "获取中...", // 当前预约信息字符串
      currentReservationObj: null, // 当前预约对象
      roomArr: [], // 房间列表
      roomIdHint: "", // 输入房间号的placeholder
      seatNumHint: "", // 输入座位号的placeholder

      startTime: libraryConfig.defaultReserveInfo.startTime, // 默认的开始时间
      endTime: libraryConfig.defaultReserveInfo.endTime, // 默认的结束时间

      roomId: "", // 输入的房间号
      seatNum: "", // 输入的座位号

      consoleInfo: "", // 控制台信息，用于查看预约明天的http response
      status: "", // 预约明天的状态
      timeCheckTimer: null // 预约明天的时间检测定时器（检测是否到了预定的时间）
    };
  },
  computed: {
    startTimeArr() {
      return Object.keys(libraryConfig.timeMap);
    },
    endTimeArr() {
      let index = self.startTimeArr.indexOf(self.startTime);

      if (index >= self.startTimeArr.indexOf(self.endTime)) {
        self.endTime = self.startTimeArr[index + 1];
      }

      if (index == -1) {
        self.endTime = "";
        index = 0;
      }

      return self.startTimeArr.slice(index + 1, self.startTimeArr.length);
    }
  },
  created() {
    self = this;

    self.init();
    self.getCurrentReservation();
  },

  methods: {
    // 初始化数据
    init() {
      token = self.$route.query.token;
      self.roomArr = libraryConfig.roomNameArr.map((roomName, index) => ({
        id: index + 1,
        name: roomName
      }));

      self.roomIdHint = `1-${self.roomArr.length}`;
    },

    // 获取当前预约，更新currentReservationObj和currentReservationStr
    async getCurrentReservation() {
      const currentReservationAPI = `/rest/v2/user/reservations?token=${token}`;

      try {
        const res = await self.$http.get(currentReservationAPI);
        const resData = res.data;

        console.log(resData);

        if (resData.code == "12") {
          // token过期，说明被顶号了
          self.$alert("被顶号，请重新登陆");
          self.currentReservationStr = "被顶号";
        } else if (resData.data) {
          // 今天有预约
          self.currentReservationObj = resData.data[0];

          let { location, onDate, begin, end } = self.currentReservationObj;
          self.currentReservationStr = `日期：${onDate},地点：${location},从${begin}到${end}`;
        } else {
          //查看是否明天有预约
          const getReservationHistoryAPI = `/rest/v2/history/1/10?token=${token}`;
          const res = await self.$http.get(getReservationHistoryAPI);
          const resData = res.data;

          if (resData.status == "success") {
            const reservationArr = resData.data.reservations;
            let tomorrowReservation = reservationArr.find(
              reservationObj =>
                reservationObj.date == getDate(2) &&
                reservationObj.stat.toLowerCase() == "reserve"
            );
            if (tomorrowReservation) {
              // 明天有预约
              let { loc, date, begin, end } = tomorrowReservation;
              self.currentReservationStr = `日期：${date},地点：${loc},从${begin}到${end}`;
              self.status = "明天已有预约";
            } else {
              // 明天没有预约
              self.currentReservationStr = "";
              // self.currentReservationId = "";
            }
          } else {
            self.$alert("被顶号，请重新登陆");
            self.currentReservationStr = "被顶号";
          }
        }
      } catch (err) {
        self.$alert("网络错误，请稍后再试", "网络错误");
      }
    },

    // 取消当前预约，参数id为预约id，取消成功返回true，否则返回false
    async cancelCurrentReservation(id) {
      const cancelCurrentReservationAPI = `/rest/v2/cancel/${id}?token=${token}`;

      try {
        const res = await self.$http.get(cancelCurrentReservationAPI);
        const resData = res.data;
        // console.log(resData);

        if (resData.status == "success") {
          return true;
        } else {
          return false;
        }
      } catch (err) {
        self.$alert("网络错误，请稍后再试", "失败");

        return false;
      }
    },

    // 获取房间的座位总数
    async getSeatTotalNumber() {
      seatMap.clear();

      let roomId = self.roomId;
      if (
        Number.isInteger(roomId) &&
        roomId <= self.roomArr.length &&
        roomId >= 1
      ) {
        roomId += 3;
        let date = getDate(1);

        const getRoomInfoAPI = `/rest/v2/room/layoutByDate/${roomId}/${date}?token=${token}`;

        try {
          const res = await self.$http.get(getRoomInfoAPI);
          const resData = res.data;

          if (resData.status == "success") {
            const roomInfo = resData.data;
            const seatInfo = roomInfo.layout;
            const seatArr = Object.values(seatInfo);

            for (const seatObj of seatArr) {
              if (seatObj.type == "seat") {
                seatMap.set(seatObj.name, seatObj.id);
              }
            }

            self.seatNumHint = `1-${seatMap.size}`;
          } else {
            self.$alert("获取座位数量失败，请稍后再试");
          }
        } catch (err) {
          self.$alert("网络错误，请稍后再试", "失败");
        }
      } else {
        self.seatNumHint = "";
      }
    },

    // 预约今天
    async reserveToday(reserveData) {
      try {
        const reserveAPI = `/rest/v2/freeBook`;

        const res = await self.$http({
          method: "post",
          url: reserveAPI,
          data: reserveData
        });
        const resData = res.data;
        console.log(resData);

        if (resData.status == "success") {
          // 预约成功
          return { status: true };
        } else {
          return { status: false, msg: resData.message };
        }
      } catch (err) {
        console.log(err);

        self.$alert("网络错误，请稍后再试", "失败");
        return { status: false };
      }
    },

    // 预约明天
    async reserveTomorrow() {
      self.freeze = true;

      let date = getDate(2);
      let seat = seatMap.get(self.seatNum.toString().padStart(3, "0"));

      if (seat == undefined) {
        self.$alert("请检查座位号");
        self.freeze = false;
      } else {
        
         if(self.$route.query.username!='2016301500173' && !checkSeat(self.roomId,self.seatNum)){
          self.$alert("该座位暂时无法预约，请选择其他座位");
          self.freeze = false;

          return;
        }

        let startTime = libraryConfig.timeMap[self.startTime];
        let endTime = libraryConfig.timeMap[self.endTime];

        let reserveData = { token, startTime, endTime, seat, date };
        console.log(reserveData);

        if (self.status != "明天已有预约") {
          self.status = "正在抢座位...";
        }

        const { hour, minute, second } = libraryConfig.startGetSeatTime;
        let startGetSeatTime = new Date();

        // 点击按钮后马上打印时间，否则要等5秒，定时器第一次执行时才会打印时间
        let now = startGetSeatTime;
        self.consoleInfo = `当前时间:${now.getHours()}点${now.getMinutes()}分${now.getSeconds()}秒`;
        console.log(self.consoleInfo);

        startGetSeatTime.setHours(hour);
        startGetSeatTime.setMinutes(minute);
        startGetSeatTime.setSeconds(second);

        // 每5秒检测一次当前时间，如果超过了10点44分40秒，就开始抢座位
        self.timeCheckTimer = setInterval(() => {
          let now = new Date();
          if (now.getTime() >= startGetSeatTime.getTime()) {
            clearInterval(self.timeCheckTimer);
            // 开始抢座位，每0.5秒发一次请求
            const reserveAPI = `/rest/v2/freeBook`;
            let getSeatTimer = setInterval(async () => {
              try {
                const res = await self.$http({
                  method: "post",
                  url: `${reserveAPI}?timestamp=${new Date()}`,
                  data: reserveData
                });

                const resData = res.data;

                console.log(resData);

                if (resData.status == "success") {
                  //抢到座位了
                  clearInterval(getSeatTimer);
                  self.status = "成功抢到座位";
                  self.consoleInfo = resData.data;
                  self.freeze = false;
                } else {
                  // 这时候有三种可能，
                  // 1：时间还没到。这时self.status==='正在抢座位...'
                  // 2：已经抢到座位了，此时是抢座位成功的那个请求之后的几个请求。这时self.status==='成功抢到座位'
                  // 3：座位被别人抢了。这是self.status==='正在抢座位...'
                  if (resData.message.startsWith("系统")) {
                    // 1
                    self.consoleInfo = resData.data;
                  } else if (!resData.message.startsWith("已有")) {
                    // 3
                    self.status = "抢座位失败";
                    self.consoleInfo = resData.data;
                    self.freeze = false;
                  } else if (resData.message.startsWith("已有")) {
                    // 2

                    self.freeze = false;

                    if (self.status == "明天已有预约") {
                      //进入这个页面时已经有了明天的预约
                      self.consoleInfo = resData.message;
                    } else {
                    }
                  }
                }
              } catch (err) {
                self.consoleInfo = "网络错误，请稍后再试";
                self.freeze = false;
                // self.$alert("网络错误，请稍后再试");
              }
            }, 500);
          } else {
            // 还没到时间
            self.consoleInfo = `当前时间:${now.getHours()}点${now.getMinutes()}分${now.getSeconds()}秒`;
            console.log(self.consoleInfo);
          }
        }, 5000);
      }
    },

    // 取消预约明天的定时器
    cancelReserveTomorrow() {
      clearInterval(self.timeCheckTimer);
      self.freeze = false;
    },

    // ------------------------------------------handler部分

    // "取消当前预约"按钮的handler
    async cancelCurrentReservation_handler() {
      self.freeze = true;

      if (self.currentReservationObj == null) {
        // 当前无预约
        self.$alert("当前无有效预约", "提示");
        self.freeze = false;
      } else {
        let success = await self.cancelCurrentReservation(
          self.currentReservationObj.id
        );
        if (success) {
          // 取消成功
          self.$alert("已成功取消当前预约");
          self.currentReservationObj = null;
          self.currentReservationStr = "";
        } else {
          self.$alert("取消失败，请稍后再试");
        }
        self.freeze = false;
      }
    },

    // "预约今天"按钮的handler
    async reserveToday_handler() {
      self.freeze = true;

      let date = getDate(1);
      let seat = seatMap.get(self.seatNum.toString().padStart(3, "0"));

      if (seat == undefined) {
        self.$alert("请检查座位号");
        self.freeze = false;
      } else {
        
        if(self.$route.query.username!='2016301500173' && !checkSeat(self.roomId,self.seatNum)){
          self.$alert("该座位暂时无法预约，请选择其他座位");
          self.freeze = false;

          return;
        }

        let startTime = libraryConfig.timeMap[self.startTime];
        let endTime = libraryConfig.timeMap[self.endTime];

        let reserveData = { token, startTime, endTime, seat, date };

        let result = await self.reserveToday(reserveData);
        if (result.status) {
          // 预约成功
          await self.getCurrentReservation(); // 更新当前预约信息

          let { location, onDate, begin, end } = self.currentReservationObj;

          self.currentReservationStr = `日期：${onDate},地点：${location},从${begin}到${end}`;
          self.$alert(`预约成功`);
          self.freeze = false;
        } else {
          self.$alert(`预约失败:${result.msg}`);
          self.freeze = false;
        }
      }
    },

    // "延迟当前预约"按钮的handler
    async delayCurrentReservation_handler() {
      self.freeze = true;
      if (self.currentReservationObj == null) {
        self.$alert("当前无有效预约");
        self.freeze = false;
      } else {
        let preStartTime = self.currentReservationObj.begin; // 当前的开始时间

        let startTime = libraryConfig.timeMap[preStartTime] + 30; // 开始时间延长半小时
        let endTime = libraryConfig.timeMap[self.currentReservationObj.end]; //结束时间
        let seat = self.currentReservationObj.seatId; // 座位id
        let date = getDate(1); // 今天的年-月-日字符串

        console.log(self.currentReservationObj);
        console.log(preStartTime, startTime, endTime);

        if (!(startTime < endTime)) {
          // 防止startTime和endTime都为undefined导致异常
          self.$alert("当前预约时长小于半小时，无法延后");
          self.freeze = false;
        } else {
          // 要post的数据
          const delayInfo = { startTime, endTime, seat, date, token };

          // 先取消当前预约
          if (
            await self.cancelCurrentReservation(self.currentReservationObj.id)
          ) {
            // 用delayInfo去预约今天
            if (await self.reserveToday(delayInfo)) {
              // 预约今天成功
              await self.getCurrentReservation(); // 更新当前预约obj和str
              self.$alert("延后成功");
              self.freeze = false;
            } else {
              // 预约今天失败
              self.$alert(
                "当前预约已经取消，但再次预约失败，请手动预约",
                "延后失败"
              );
              self.freeze = false;
            }
          } else {
            // 取消当前预约失败
            self.$alert("当前预约取消失败，请稍后再试", "延后失败");
            self.freeze = false;
          }
        }
      }
    }
  }
};
</script>


<style lang="scss" scoped>
.home {
  .el-container {
    .el-header {
      height: 100% !important;

      .header {
        text-align: center;
        padding: 0 10px;

        .success_info {
          font-size: 25px;
          margin-top: 20px;
        }
      }
    }

    .el-main {
      .current_reservation {
        text-align: center;
        font-size: 16px;
      }

      .reservation_part {
        margin: 20px;

        .el-table {
          margin: auto;
          max-width: 300px;
        }

        .el-form {
          margin-top: 20px;
          text-align: center;
          .el-input {
            width: 60px;
          }
        }

        .reservation_data {
          width: 300px;
          margin: 10px auto;

          .el-input {
            width: 70px;
          }

          .el-select {
            width: 150px;
          }
        }

        .reserve_btn_group {
          margin-top: 15px;
          width: 300px;
          margin: auto;

          text-align: center;
          .el-button {
            width: 60%;
            margin-top: 13px;
          }
        }

        .console {
          text-align: center;
          margin-top: 30px;
        }
      }
    }
  }
}
</style>
