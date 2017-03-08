using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using WebFileTransfer.Models;
using System.IO;
using System.Text.RegularExpressions;
using Microsoft.Net.Http.Headers;

namespace WebFileTransfer.Controllers
{
    [Route("api/[controller]/[action]")]
    public class FileDataController : Controller
    {
        private static Regex driveMatch = new Regex(@"^\w:");

        [HttpPost]
        public ServiceData Data([FromBody] PathParam path)
        {
            if (GlobalConfig.Enabled == false)
                return null;

            if (path == null)
                return null;

            ServiceData data = new ServiceData();
            path.Path = path.Path ?? "";

            if (path.Path.StartsWith(GlobalConfig.FileRoot) == true)
                path.Path = path.Path.Substring(GlobalConfig.FileRoot.Length);
            if (path.Path.StartsWith("\\") == true)
                path.Path = path.Path.Substring(1);
            if (path.Path.StartsWith("..") == true)
                return null;
            if (driveMatch.Match(path.Path).Success == true)
                return null;

            string folderpath = Path.Combine(GlobalConfig.FileRoot, path.Path);
            if (path.Path.Trim().Length <= 0)
                data.Path = GlobalConfig.RootName;
            else
                data.Path = GlobalConfig.RootName + "\\" + path.Path;
            if (Directory.Exists(folderpath) == true)
            {

                string[] files = Directory.GetFiles(folderpath);
                string[] directories = Directory.GetDirectories(folderpath);
                List<FileData> fileInfos = (from file
                                            in files
                                            select FileDataFromInfo(new FileInfo(file))
                                            ).ToList();
                List<DirectoryData> directoryInfos = (from directory
                                                      in directories
                                                      select DirectoryDataFromInfo(new DirectoryInfo(directory))
                                                      ).ToList();

                data.Files = fileInfos;
                data.Directories = directoryInfos;
            }
            else
            {
                data.Files = null;
                data.Directories = null;
            }
            return data;
        }

        [HttpPost]
        public IActionResult Down([FromForm] string path)
        {
            if (GlobalConfig.Enabled == false)
                return new BadRequestResult();

            if (path == null)
                return new BadRequestResult();

            path = path ?? "";

            if (path.StartsWith(GlobalConfig.FileRoot) == true)
                path = path.Substring(GlobalConfig.FileRoot.Length);

            if (path.StartsWith("\\") == true)
                path = path.Substring(1);

            if (path.StartsWith("..") == true)
                return new ForbidResult();
            if (driveMatch.Match(path).Success == true)
                return new ForbidResult();

            string filepath = null;
            try
            {
                filepath = Path.Combine(GlobalConfig.FileRoot, path);
            }
            catch
            {
                return new BadRequestResult();
            }

            if (System.IO.File.Exists(filepath) == true)
            {
                try
                {
                    Stream fs = System.IO.File.OpenRead(filepath);
                    FileStreamResult fsr = new FileStreamResult(fs, "application/octet-stream");
                    fsr.FileDownloadName = Path.GetFileName(filepath);
                    return fsr;
                }
                catch
                {
                    return new BadRequestResult();
                }

            }
            else
                return new BadRequestResult();
        }


        private FileData FileDataFromInfo(FileInfo file)
        {
            return new FileData()
            {
                Name = file.Name,
                Path = file.FullName,
                Bytes = file.Length
            };
        }
        private DirectoryData DirectoryDataFromInfo(DirectoryInfo directory)
        {
            return new DirectoryData()
            {
                Path = directory.FullName,
                Name = directory.Name
            };
        }
    }
}
