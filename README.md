# WebFileTransfer
Web端文件查看以及下载服务

## 架构
asp.net core webapi

## 支持
点击查看 [.net core](https://www.microsoft.com/net/core) 支持的平台

## 如何使用
1. 配置根路径

    修改 appsettings.json 中的 FileRoot

2. 修改监听url和端口

    Program.cs
    ``` CSharp
    var host = new WebHostBuilder()
               // ...
               .UseUrls("http://*:5000")
               //...
    ```

3. 启动程序

    ```BAT
    dotnet run
    ```

## For dev
- 只有一个 Controller, 后台逻辑还是比较简单
- 前端靠ajax与后端通信
- 使用 jquery.fileDownload 通过发送POST请求下载文件

## Improvement remained
- 安全性
- 上传功能
- 文件图标
- 控制台log显示数据传输状态