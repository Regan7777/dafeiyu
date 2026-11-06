---
title: "Shadowrocket (小火箭) iOS 新手配置、节点订阅与模块规则详解"
category: "科学上网"
categoryClass: "tag-proxy"
categoryIcon: "fa-solid fa-paper-plane"
date: "2026-10-20"
readingTime: "10分钟阅读"
views: "7,350 次阅读"
lead: "Shadowrocket（小火箭）作为 iOS 平台保有量最高的高性能网络工具，以其对几乎全协议的原生支持与出色的后台保活调度深受青睐。本文手把手梳理正版购买、订阅导入、配置模式分流、去广告模块安装以及后台省电防断连优化技巧。"
description: "Shadowrocket（小火箭）作为 iOS 平台保有量最高的高性能网络工具，以其对几乎全协议的原生支持与出色的后台保活调度深受青睐。本文手把手梳理正版购买、订阅导入、配置模式分流、去广告模块安装以及后台省电防断连优化技巧。"
keywords: [
  "Shadowrocket",
  "小火箭配置",
  "iOS科学上网",
  "小火箭节点导入",
  "分流规则",
  "美区AppleID"
]
faqs:
  - q: "为什么在国区 App Store 搜索不到 Shadowrocket（小火箭）？"
    a: "因合规政策限制，网络代理类工具均未在国区上架。用户需准备一个外区（如美区、日区、港区）Apple ID 并登录 App Store 购买下载。下载完成后可随时切回主力国区账号，完全不影响后续正常使用与版本更新。"
  - q: "小火箭全局路由中的「配置」、「代理」与「直连」该选哪个？"
    a: "日常使用必须选择「配置」（Config）模式，流量会自动根据分流规则智能处理（国内直连、海外代理）；若选「代理」（Proxy）则所有流量包括微信、网银都会绕道海外导致延迟飙升；「直连」（Direct）则完全不经过代理。"
  - q: "节点测速显示大量“超时”，但连接后依然能正常访问外网？"
    a: "小火箭默认测速是发起一次到 Google 或 Cloudflare 的真实 HTTP 探测。若目标测试地址被临时阻断会显示超时，但不代表节点失效。可以长按节点单独测试 ICMP Ping，或直接在浏览器打开海外页面验证。"
relatedArticles: ["clash-verge","sing-box-guide","nextin-guide","dns-leak-fix"]
prevId: "sing-box-guide"
nextId: "dns-leak-fix"
---

<div class="download-box"> <div class="download-box-header"> <i class="fa-solid fa-cloud-arrow-down"></i> Shadowrocket (小火箭) 官方下载渠道 </div> <div class="download-links-grid"> <a href="https://apps.apple.com/app/shadowrocket/id932747118" target="_blank" rel="noopener noreferrer" class="download-btn"> <span class="btn-text"><i class="fa-brands fa-apple"></i> Apple App Store 官方正版下载 (非中国大陆区)</span> <i class="fa-solid fa-arrow-up-right-from-square"></i> </a> </div> </div> <h2 id="section-1">一、Shadowrocket (小火箭) 简介与正版安装</h2> <p>在 iOS 生态中，<strong>Shadowrocket（俗称小火箭）</strong> 凭借极佳的性价比（仅需 2.99 美元）、对几乎所有主流网络协议的全面支持，以及高度契合 iOS 系统的后台唤醒机制，成为保有量最高的高性能网络工具。初学者请注意：<strong>中国大陆地区 App Store 无法搜到正版 Shadowrocket</strong>，切勿在搜索结果中下载带有各类山寨后缀的盗版诈骗 App。</p> <p>合规获取方式为：注册或使用海外区域（如美区、日区、港区）的个人 Apple ID，在官方 App Store 搜索 <code>Shadowrocket</code>（开发者为 Shadow Launch Technology Group INC.），通过海外礼品卡或双币信用卡支付购买安装。</p> <h2 id="section-2">二、订阅导入与节点管理基础</h2> <p>完成安装并打开应用后，首次添加机场订阅非常简便：</p> <ol> <li>点击主界面右上角的「+」号图标。</li> <li>在第一栏「类型」中，点击选择为 <code>Subscribe (订阅)</code>。</li> <li>在「URL」栏中粘贴机场后台复制的 Shadowrocket / V2Ray / Clash 通用订阅链接。</li> <li>点击右上角「完成 (Done)」，应用将自动通过网络拉取所有可用节点列表。</li> </ol> <blockquote> <p><strong> 测速实用技巧：</strong>进入应用下方的「设置 (Settings)」->「订阅」，勾选「打开时更新」和「自动更新」，这样每次进入 App 都会自动拉取最新节点；点击主页顶部的「连通性测试」，可按照 Ping 延迟对节点进行升序排序，方便快速挑选优质低延时线路。</p> </blockquote> <h2 id="section-3">三、三种全局路由模式详解</h2> <p>在 Shadowrocket 首页中间，有一个核心控制开关「全局路由」：</p> <ul> <li><strong>配置 (Config) 模式【强烈推荐】：</strong>必须长年开启此模式！它会根据规则策略分流——访问国内服务（百度、微信、网易云等）自动走直连，访问海外服务走节点，访问广告域名直接丢弃。</li> <li><strong>代理 (Proxy) 模式：</strong>全局所有流量强制经过代理节点。通常仅在特定测试或极特殊网络环境下使用，日常开启会导致国内应用打开极慢甚至封禁 IP。</li> <li><strong>直连 (Direct) 模式：</strong>全局绕过代理直接访问。等同于断开连接。</li> </ul> <h2 id="section-4">四、模块 (Modules) 进阶与去广告实操</h2> <p>Shadowrocket 支持强悍的模块功能，可以在不修改底层分流规则的前提下，热插拔式注入去广告规则与功能增强脚本：</p> <p>在下方导航栏选择「配置」-> 点击当前生效的规则文件 -> 选择「模块」-> 点击右上角「+」，粘贴主流开源去广告模块链接。模块不仅能有效过滤 YouTube 网页广告与各类资讯流推广，还能一键开启 HTTPS 解密（需配合安装并信任本地根证书），实现深层请求拦截。</p> <h2 id="section-5">五、iOS 后台保活与省电优化策略</h2> <p>很多用户抱怨小火箭挂在后台耗电快，或者锁屏一段时间后网络自动中断。实际上只需合理配置以下两项参数：</p> <ul> <li><strong>按需连接 (On Demand)：</strong>在「设置」->「按需连接」中开启，设置在 Wi-Fi 和蜂窝网络断开或重连时由系统自动拉起 VPN 守护进程，真正做到无感后台常驻。</li> <li><strong>关闭多余日志写入：</strong>进入「设置」->「日志」，将日志记录级别调整为「关闭」或「仅错误」，大幅减少闪存持续 I/O 写入，有效降低设备发热与待机耗电。</li> </ul>
