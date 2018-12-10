const timeMap = { '08:00': 480, '08:30': 510, '09:00': 540, '09:30': 570, '10:00': 600, '10:30': 630, '11:00': 660, '11:30': 690, '12:00': 720, '12:30': 750, '13:00': 780, '13:30': 810, '14:00': 840, '14:30': 870, '15:00': 900, '15:30': 930, '16:00': 960, '16:30': 990, '17:00': 1020, '17:30': 1050, '18:00': 1080, '18:30': 1110, '19:00': 1140, '19:30': 1170, '20:00': 1200, '20:30': 1230, '21:00': 1260, '21:30': 1290, '22:00': 1320, "22:30": 1350 };
const roomNameArr = ["一楼3C创客空间", "一楼创新学习讨论区", "二楼西", "二楼东", "三楼西", "四楼西", "三楼东", "四楼东", "三楼自习室"];
const host = "https://seat.lib.whu.edu.cn:8443";
const startGetSeatTime = { // 开始抢座位的时间
    hour: 22,
    minute: 44,
    second: 45
};

const defaultReserveInfo = { // 默认的预约信息，由于输入房间号的input有input事件监听，可以用来检测网络是否正常，所以暂时不提供房间号和座位号的默认值
    startTime: '14:00',
    endTime: '22:00'
};

export default { timeMap, roomNameArr, host, startGetSeatTime, defaultReserveInfo };
