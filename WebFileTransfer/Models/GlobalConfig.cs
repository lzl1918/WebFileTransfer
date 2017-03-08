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
}
