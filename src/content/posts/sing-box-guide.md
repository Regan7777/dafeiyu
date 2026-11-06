---
title: "Sing-box 新一代全平台核心配置与规则集 (Rule-set) 实战进阶"
category: "科学上网"
categoryClass: "tag-proxy"
categoryIcon: "fa-solid fa-paper-plane"
date: "2026-10-28"
readingTime: "12分钟阅读"
views: "5,140 次阅读"
lead: "Sing-box 作为新一代通用网络核心，以纯 Go 编写带来极致性能与极低内存开销。其开创性的二进制规则集 (Rule-set, .srs) 相比庞大文本规则节省高达 80% 内存。本文详析 JSON 顶层架构、Rule-set 高性能路由与透明代理实操。"
description: "Sing-box 作为新一代通用网络核心，以纯 Go 编写带来极致性能与极低内存开销。其开创性的二进制规则集 (Rule-set, .srs) 相比庞大文本规则节省高达 80% 内存。本文详析 JSON 顶层架构、Rule-set 高性能路由与透明代理实操。"
keywords: [
  "Sing-box教程",
  "Rule-set规则集",
  "通用代理核心",
  "VLESS配置",
  "Hysteria2",
  "Sing-box出海"
]
faqs:
  - q: "Sing-box 和传统 Clash 内核相比，主要核心优势在哪些方面？"
    a: "Sing-box 基于纯 Go 原生底层编写，协议兼容性极其激进，原生支持 Hysteria 2、TUIC、VLESS Reality 等新一代抗封锁协议。在内存控制与高并发连接下的 CPU 消耗方面比传统内核低 30%~50%，特别适合软路由或低配设备长效驻留。"
  - q: "什么是 Rule-set（规则集），它比传统的长规则列表好在哪里？"
    a: "传统规则需要将数万条域名和 IP 硬编码在本地配置中，导致启动极慢、内存暴涨。Rule-set 将规则预编译为二进制 SRS 格式，客户端可按需异步拉取并毫秒级匹配，兼顾了秒级启动与极低内存开销。"
  - q: "为什么开启 Sing-box TUN 模式后，部分国内应用加载卡顿？"
    a: "属于分流规则顺序或 DNS 配置不当导致。需确保规则集中 geosite-geolocation-cn 与 geoip-cn 置于前置并设置为 direct（直连），同时检查本地路由的默认 DNS 是否与系统上游发生冲突。"
relatedArticles: ["clash-verge","karing-guide","dns-leak-fix","clash-mi","shadowrocket-ios"]
prevId: "clash-verge"
nextId: "shadowrocket-ios"
---

<div class="download-box"> <div class="download-box-header"> <i class="fa-solid fa-cloud-arrow-down"></i> Sing-box 官方核心与客户端下载渠道 </div> <div class="download-links-grid"> <a href="https://github.com/SagerNet/sing-box/releases" target="_blank" rel="noopener noreferrer" class="download-btn"> <span class="btn-text"><i class="fa-brands fa-github"></i> GitHub Releases (全平台核心与安装包)</span> <i class="fa-solid fa-arrow-up-right-from-square"></i> </a> <a href="https://sing-box.sagernet.org/" target="_blank" rel="noopener noreferrer" class="download-btn"> <span class="btn-text"><i class="fa-solid fa-book"></i> Sing-box 官方文档与发布中心</span> <i class="fa-solid fa-arrow-up-right-from-square"></i> </a> <a href="https://play.google.com/store/apps/details?id=io.nekohasekai.sfa" target="_blank" rel="noopener noreferrer" class="download-btn"> <span class="btn-text"><i class="fa-brands fa-google-play"></i> Google Play (SFA Android 客户端)</span> <i class="fa-solid fa-arrow-up-right-from-square"></i> </a> </div> </div> <h2 id="section-1">一、认识 Sing-box：通用代理平台新标杆</h2> <p><strong>Sing-box</strong> 是由 nekohasekai 开发的通用代理平台与路由核心。与老旧的 Xray / V2Ray 和传统 Clash 相比，Sing-box 采用纯 Go 语言从零编写，放弃了沉重的历史包袱，在吞吐性能、并发连接开销和跨平台一致性上表现极为惊艳。无论是 Linux 软路由、macOS、Windows 还是 iOS / Android，Sing-box 都能以极低的 CPU 与内存占用稳定运行。</p> <p>随着新版 Sing-box 普及，其引入的 <strong>Rule-set（二进制规则集，.srs 格式）</strong> 彻底革新了以往庞大的文本规则匹配机制，内存占用减少 80% 以上，是目前追求极客极致性能的首选方案。</p> <h2 id="section-2">二、Sing-box 核心配置架构解密</h2> <p>Sing-box 统一采用清晰的 JSON 格式规范，其核心骨架由以下五个顶层对象构成：</p> <ul> <li><code>dns</code>：定义内置 DNS 服务器、本地纯净解析、远程 DoH 解析与 Fake-IP 缓存规则。</li> <li><code>inbounds</code>：入站监听模块。包括本地 SOCKS5、HTTP 混杂端口以及 <code>tun</code> 虚拟网卡配置。</li> <li><code>outbounds</code>：出站协议模块。包括具体的节点（Shadowsocks、Hysteria2、Vless 等）以及逻辑选择器（selector、urltest、direct、block）。</li> <li><code>route</code>：核心路由分流模块。负责将数据包按照规则集、端口、地理位置分配给指定出站。</li> <li><code>experimental</code>：实验性高级配置，如 Clash API 兼容监听接口、缓存持久化等。</li> </ul> <h2 id="section-3">三、Rule-set 二进制规则集进阶实战</h2> <p>传统代理软件在规则较多（如导入数万条广告或国内域名）时，内存常飙升至数百兆甚至触发 OOM 崩溃。Sing-box 采用预编译的 <code>.srs</code> 二进制格式，路由引擎能在纳秒级完成前缀树检索：</p> <pre><code class="language-json">{ "route": { "rule_set": [ { "tag": "geosite-category-ads-all", "type": "remote", "format": "binary", "url": "https://raw.githubusercontent.com/SagerNet/sing-geosite/rule-set/geosite-category-ads-all.srs", "download_detour": "proxy" }, { "tag": "geosite-cn", "type": "remote", "format": "binary", "url": "https://raw.githubusercontent.com/SagerNet/sing-geosite/rule-set/geosite-cn.srs", "download_detour": "proxy" } ], "rules": [ { "rule_set": "geosite-category-ads-all", "outbound": "block" }, { "rule_set": "geosite-cn", "outbound": "direct" }, { "ip_is_private": true, "outbound": "direct" }, { "outbound": "proxy" } ] } }</code></pre> <p>通过配置 <code>download_detour</code>，规则集可以在后台通过当前代理节点静默更新，即使遇到网络波动也不会阻塞整体转发线程。</p> <h2 id="section-4">四、全平台 TUN 模式与无感透明代理</h2> <p>在 Linux / OpenWrt 软路由或桌面端，开启 TUN 入站可以完全告别繁琐的应用代理设置。Sing-box 的 TUN 引擎自带极度精简的虚拟驱动支持：</p> <pre><code class="language-json">{ "inbounds": [ { "type": "tun", "tag": "tun-in", "interface_name": "sing-tun", "inet4_address": "172.19.0.1/30", "auto_route": true, "strict_route": true, "stack": "mixed", "sniff": true } ] }</code></pre> <p>其中 <code>stack: "mixed"</code> 模式能够自动在高并发 TCP 吞吐和低延迟 UDP 处理之间找到最佳性能平衡点，让日常测速和跨国视频流体验顺畅丝滑。</p>
