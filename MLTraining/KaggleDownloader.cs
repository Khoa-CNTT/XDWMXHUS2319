using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MLTraining
{
    public class KaggleDownloader
    {
        public static void DownloadDataset(string dataset, string outputPath)
        {
            string kaggleCommand = $"kaggle datasets download -d {dataset} -p {outputPath} --unzip";
            var processInfo = new ProcessStartInfo("cmd.exe", $"/c {kaggleCommand}")
            {
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using (var process = Process.Start(processInfo))
            {
                if (process == null)
                {
                    Console.WriteLine("❌ Không thể khởi động tiến trình.");
                    return;
                }
                process.WaitForExit();
                string result = process.StandardOutput.ReadToEnd();
                string error = process.StandardError.ReadToEnd();

                Console.WriteLine(result);
                if (!string.IsNullOrEmpty(error))
                {
                    Console.WriteLine("❌ Lỗi khi tải dataset từ Kaggle: " + error);
                }
            }
        }
    }
}
