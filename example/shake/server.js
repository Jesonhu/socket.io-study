/**
 * `摇一摇功能` `socket.io`服务端 
 * 
 * @link [socket.io](https://socket.io/)
 * @link [](https://socket.io/docs/emit-cheatsheet/)
 * @link [removeAllListeners](https://github.com/darrachequesne/socket.io-fiddle/blob/issue/removeAllListeners/server.js)
 */
const app = require('express');
const http = require('http').Server(app);
const io = require('socket.io')(http);

const shake_server = {
  PORT: 8206,
  /** 在线用户 */
  onlineUserList: [],
  /** 在线人数 */
  onlineUserCount: 0,
  /** 是否开启调试 */
  isOpenLog: true,
  /**  */
  socket: null,
  /** `socket` 广播对象  */
  // broadcast: null,
  /**
   * 建立`新连接` 
   */
  onConnect() {
    const _this = this;
    io.on('connection', function (socket) {
      if (this.isOpenLog) console.log('新连接已创建 ===== SUCCESS');
      _this.socket = socket;

      _this.onLogin().onDisconnect();
    });
    return this;
  },
  /**
   * 监听新用户加入.
   * 
   * `mobile_login`
   */
  onLogin() {
    this.socket.on('mobile_login', (data) => {
      this.onlineUserList.push(data);
      if (this.isOpenLog) console.log('mobile_login', this.onlineUserList);

      this.emitMobileLoginUsers(this.onlineUserList);
    });
    return this;
  },
  /**
   * 派发手机参与摇一摇的人 
   */
  emitMobileLoginUsers(onlineList) {
    // this.socket.emit('mobile_login_users', onlineList);
    // 这里需要使用`broadcast`广播.
    // 如果不使用广播，只有自己能够收到`mobile_login_users`
    // 
    this.socket.broadcast.emit('mobile_login_users', onlineList);
    if (this.isOpenLog) console.log('参与的人', onlineList);
  },
  /**
   * 监听pc开启了摇一摇.
   * 
   * `open_shake`指令应由PC大屏发出 
   */
  onOpenShake() {
    this.socket.on('open_shake', (data) => {
      this.emitOpenShake(data);
    });
  },
  /**
   * 派发`mobile`摇一摇配置信息
   */
  emitOpenShake(config) {
    this.socket.emit('open_shake', config)
  },
  /**
   * 监听摇一摇状态 
   */
  onStatusShake() {
    this.socket.on('status_shake', (status) => {

      // TODO: 摇一摇数据要整理合并
      const data = status;

      this.emitStatusShake(data);
    });
  },
  /**
   * 派发摇一摇状态 
   */
  emitStatusShake(data) {
    this.socket.emit('status_shake', data);

    // 有人完成了摇一摇
    // this.emitCompleteShake([]);
  },
  /**
   * 派发摇一摇完成 
   */
  emitCompleteShake(completeLists) {
    this.socket.emit('complete_shake', completeLists);
  },
  /**
   * 监听用户退出 
   */
  onDisconnect() {
    this.socket.on('disconnect', (data) => {
      if (this.isOpenLog) console.log('退出', data);
    });
    return this;
  }
}

/* unicode 编码转换 start */
/**
 * 将参数的[userName]转换为中文，并返回转换后的参数 
 * @desc 转码的原因：nodejs(服务端)乱码。
 *       前端先用encodeURIComponent()进行编码，
 *       后台用decodeURIComponent()解码，就能得到正确的中文。
 *       为什么要对URI进行编码再解码呢，其中一个原因就是我们现在遇到的问题，中文乱码，为什么会中文乱码，
 *       因为如果URI的编码格式采用的是ASCII码，而不是Unicode，这也就是说你不能在URI中包含任何非ASCII字符，例如中文。
 *       否则如果客户端浏览器和服务端浏览器支持的字符集不同的情况下，中文可能会造成问题。
 */
function sigleHexToDec(obj) {
  // console.log('sigleHexToDec', obj, obj.userName);
  obj.name = hexToDec(obj.name);
  // console.log('singleHexToDec', obj.userName);
  return obj;
};

/**
 * unicode转中文
 * @desc 由于unescape(str)已被废除，
 *       采用 encodeURIComponent(str)== 转换为Unicode ==> decodeURIComponent(str) ==> 转码为中文
 * @example '';
 */
function hexToDec(str) {
  str = String(str);
  // 这一步其实没必要客户端已经codeURIComponent(str)了
  // console.log('hexToDec', str);
  str = str.replace(/\\/g, "%");

  // let str1 = unescape(str);
  // return unescape(str);
  
  // console.log( str1 );
  return decodeURIComponent(str);
};
/* unicode 编码转换 end */

shake_server.onConnect();

http.listen(shake_server.PORT, () => {
  console.log(`摇一摇服务端, 监听端口: ${shake_server.PORT} ===== SUCCESS`);
});