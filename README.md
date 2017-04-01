# WebFileTransfer
File listing and downloading service hosted in the web

## Capabilities
- List contents
- Download files
- Upload files
- Make new directory

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
- More file icons
- Display the requests in console window