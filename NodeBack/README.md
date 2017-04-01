# Node.js Backend
build the transfer service backend with node.js

## Capabilities
- List contents
- Download files
- Upload files
- Make new directory

## Architecture
node.js

## How to use
1. Configure paths

    All options are recorded in `config.json`
    - content root path
        
        `content_root`: you can select which directory should be set to the root dir while listing files and directories

    - upload temperory folder

        `upload_tmp`: while uploading files, the service would put them into a temperory directory, and then move them to a correct directory. it is recommend that set `upload_tmp` the same drive with `content_root`

    - listening port

        `port`: determines which port the server should use

    - wwwroot

        `wwwroot`: used for static website contents.

2. Start with node.js

    ```BAT
    node server.js
    ```

## For dev
- There is a pipeline to handle requests. When request arrives, server check through with the pipeline and select a component to handle the request.
    
     By default, `defaultfiles` and `staticfiles` are added firstly to the pipeline to allow front-end files to be correctly downloaded.

- FE communicates with BE by ajax
- `jquery.fileDownload` is included to download files through `POST` method

## Improvement remained
- Security
- More file icons
- Display the requests in console window