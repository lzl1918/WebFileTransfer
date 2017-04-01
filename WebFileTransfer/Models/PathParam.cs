using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebFileTransfer.Models
{
    public sealed class PathParam
    {
        public string Path { get; set; }
    }

    public sealed class NameParam
    {
        public string Name { get; set; }
        public string Path { get; set; }
    }
}
