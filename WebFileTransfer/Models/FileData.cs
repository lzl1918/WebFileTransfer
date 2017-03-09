using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebFileTransfer.Models
{
    public sealed class ServiceData
    {
        public string Path { get; set; }
        public IEnumerable<FileData> Files { get; set; }
        public IEnumerable<DirectoryData> Directories { get; set; }
    }

    public sealed class DirectoryData
    {
        public string Path { get; set; }
        public string Name { get; set; }

    }
    public sealed class FileData
    {
        public string Path { get; set; }
        public string Name { get; set; }
        public long Bytes { get; set; }
        public string FileExt { get; set; }
    }
}
