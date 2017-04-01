using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using WebFileTransfer.Models;
using System.IO;
using System.Text.RegularExpressions;
using Microsoft.Net.Http.Headers;
using WebFileTransfer.Results;
using Microsoft.AspNetCore.Http;

namespace WebFileTransfer.Controllers
{
    [Route("api/[controller]/[action]")]
    public class FileDataController : Controller
    {
        private static Regex driveMatch = new Regex(@"^\w:");
        private static Regex invalidMatch = new Regex(@"[\\\/\:\*\?\""\<\>\|]");

        [HttpPost]
        public ServiceData Data([FromBody] PathParam path)
        {
            if (GlobalConfig.Enabled == false)
                return null;

            if (path == null)
                return null;

            ServiceData data = new ServiceData();
            path.Path = path.Path ?? "";

            if (path.Path.StartsWith(GlobalConfig.ContentRoot) == true)
                path.Path = path.Path.Substring(GlobalConfig.ContentRoot.Length);
            if (path.Path.StartsWith("\\") == true)
                path.Path = path.Path.Substring(1);
            if (path.Path.StartsWith("..") == true)
                return null;
            if (driveMatch.Match(path.Path).Success == true)
                return null;

            string folderpath = Path.Combine(GlobalConfig.ContentRoot, path.Path);
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

            if (path.StartsWith(GlobalConfig.ContentRoot) == true)
                path = path.Substring(GlobalConfig.ContentRoot.Length);

            if (path.StartsWith("\\") == true)
                path = path.Substring(1);

            if (path.StartsWith("..") == true)
                return new ForbidResult();
            if (driveMatch.Match(path).Success == true)
                return new ForbidResult();

            string filepath = null;
            try
            {
                filepath = Path.Combine(GlobalConfig.ContentRoot, path);
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
                    ExtFileStreamResult fsr = new ExtFileStreamResult(fs, "application/octet-stream");
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

        [HttpPost]
        public void Up([FromForm] string fileName, [FromForm] string filePath, [FromForm] IFormFileCollection files)
        {
            if (GlobalConfig.Enabled == false) return;
            if (files.Count <= 0)
                files = Request.Form.Files;
            if (files.Count <= 0) return;

            if (filePath.StartsWith(GlobalConfig.ContentRoot) == true)
                filePath = filePath.Substring(GlobalConfig.ContentRoot.Length);
            if (filePath.StartsWith("\\") == true)
                filePath = filePath.Substring(1);
            if (filePath.StartsWith("..") == true)
                return;
            if (driveMatch.Match(filePath).Success == true)
                return;
            string path = Path.Combine(GlobalConfig.ContentRoot, filePath);
            path = PathHelper.ResolvePath(path);
            if (path == null)
                return;
            if (path.StartsWith(GlobalConfig.ContentRoot) == false)
                return;

            if (files.Count == 1)
            {
                fileName = fileName ?? files[0].FileName;
                string fullPath = Path.Combine(path, fileName);
                if (System.IO.File.Exists(fullPath))
                    return;
                FileStream stream = System.IO.File.Create(fullPath);
                files[0].CopyTo(stream);
                stream.Flush();
                stream.Dispose();
            }
            else
            {
                string fullPath = null;
                foreach (IFormFile file in files)
                {
                    fullPath = Path.Combine(path, file.FileName);
                    if (System.IO.File.Exists(fullPath))
                        continue;
                    FileStream stream = System.IO.File.Create(fullPath);
                    file.CopyTo(stream);
                    stream.Flush();
                    stream.Dispose();
                }
            }
        }

        [HttpPost]
        public void CreateDir([FromBody] NameParam name)
        {
            if (invalidMatch.IsMatch(name.Name))
                return;

            if (name.Path.StartsWith(GlobalConfig.ContentRoot) == true)
                name.Path = name.Path.Substring(GlobalConfig.ContentRoot.Length);
            if (name.Path.StartsWith("\\") == true)
                name.Path = name.Path.Substring(1);
            if (name.Path.StartsWith("..") == true)
                return;
            if (driveMatch.Match(name.Path).Success == true)
                return;
            string path = Path.Combine(GlobalConfig.ContentRoot, name.Path);
            path = PathHelper.ResolvePath(path);
            if (path == null)
                return;
            if (path.StartsWith(GlobalConfig.ContentRoot) == false)
                return;
            string[] dirs = Directory.GetDirectories(path);
            string lower = name.Name.ToLower();
            if (dirs.Any((str) => str.ToLower() == lower)) return;
            try
            {
                DirectoryInfo dir = new DirectoryInfo(path);
                dir.CreateSubdirectory(name.Name);

            }
            catch
            {

            }
        }

        private FileData FileDataFromInfo(FileInfo file)
        {
            return new FileData()
            {
                Name = file.Name,
                Path = file.FullName,
                Bytes = file.Length,
                FileExt = file.Extension
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
