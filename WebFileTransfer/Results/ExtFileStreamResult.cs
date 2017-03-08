// see FileStreamResult
// https://github.com/aspnet/Mvc/blob/760c8f38678118734399c58c2dac981ea6e47046/src/Microsoft.AspNetCore.Mvc.Core/FileStreamResult.cs

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Internal;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Net.Http.Headers;
using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;

namespace WebFileTransfer.Results
{
    public sealed class ExtFileStreamResult : FileStreamResult
    {
        public ExtFileStreamResult(Stream fileStream, string contentType) : this(fileStream, MediaTypeHeaderValue.Parse(contentType))
        {
        }

        public ExtFileStreamResult(Stream fileStream, MediaTypeHeaderValue contentType) : base(fileStream, contentType)
        {
        }

        public override Task ExecuteResultAsync(ActionContext context)
        {
            if (context == null)
            {
                throw new ArgumentNullException(nameof(context));
            }

            var executor = context.HttpContext.RequestServices.GetRequiredService<FileStreamResultExecutor>();
            context.HttpContext.Response.ContentLength = FileStream.Length;
            return executor.ExecuteAsync(context, this);
        }

    }
}