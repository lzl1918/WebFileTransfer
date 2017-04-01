using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebFileTransfer.Models
{
    public static class GlobalConfig
    {
        public static string FileRoot { get; set; }
        public static string RootName { get { return System.IO.Path.GetFileName(FileRoot); } }
        public static bool Enabled { get; set; }


    }

    public static class PathHelper
    {
        public static string ResolvePath(string path)
        {
            if (System.IO.Directory.Exists(path))
            {
                System.IO.DirectoryInfo dirinfo = new System.IO.DirectoryInfo(path);
                return dirinfo.FullName;
            }
            else
                return null;
        }
    }
}
