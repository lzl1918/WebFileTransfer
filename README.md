# WebFileTransfer
File listing and downloading service hosted in the web

## Architecture
asp.net core webapi

## Platform support
click to check the platform supported by [.net core](https://www.microsoft.com/net/core)

## How to use
1. Configure the file root path

    Edit ` FileRoot ` option in file appsettings.json 

2. Configure the listening url and port

    Program.cs
    ``` CSharp
    var host = new WebHostBuilder()
               // ...
               .UseUrls("http://*:5000")
               //...
    ```

3. Start dotnet core

    ```BAT
    dotnet run
    ```

## For dev
- There is only one `Controller`.
- FE communicates with BE by ajax
- `jquery.fileDownload` is included to download files through `POST` method

## Improvement remained
- Security
- Upload files to server
- More file icons
- Display the requests in console window