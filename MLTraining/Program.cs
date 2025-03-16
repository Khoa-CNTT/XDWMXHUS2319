using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using CsvHelper;
using CsvHelper.Configuration;
using Microsoft.Extensions.Configuration;
using Microsoft.ML;


namespace MLTraining
{
    class Program
    {
        static async Task Main(string[] args)
        {
            Console.OutputEncoding = Encoding.UTF8;
            Console.WriteLine("🚀 Bắt đầu thu thập dữ liệu huấn luyện...");

            var config = new ConfigurationBuilder()
                .AddUserSecrets<Program>()
                .Build();

            string apiKey = config["HuggingFace:ApiKey"] ?? "";
            var allData = new List<ModelInput>();

            try
            {
                // 1️⃣ Lấy dữ liệu bài viết từ API Database của bạn
                var fetcher = new DataFetcher();
                var dbData = await fetcher.GetTrainingDataFromAPI();
                Console.WriteLine($"✅ Lấy {dbData.Count} bài viết từ Database API!");
                allData.AddRange(dbData);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Lỗi lấy dữ liệu từ Database API: {ex.Message}");
            }

            try
            {
                // 2️⃣ Lấy dữ liệu từ Hugging Face API
                var hfFetcher = new HuggingFaceFetcher(apiKey);
                var hfData = await hfFetcher.GetTrainingData();
                Console.WriteLine($"✅ Lấy {hfData.Count} bài viết từ Hugging Face!");
                allData.AddRange(hfData);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Lỗi lấy dữ liệu từ Hugging Face API: {ex.Message}");
            }
            // 🟢 3️⃣ Dữ liệu từ Fake Data Generator
            var fakeData = FakeDataGenerator.GenerateFakeData(100);
            Console.WriteLine($"✅ Tạo {fakeData.Count} bài viết giả lập!");
            allData.AddRange(fakeData);
            if (allData.Count > 0)
            {
                // 3️⃣ Lưu vào CSV để huấn luyện ML.NET
                string csvPath = "datasets/training_data.csv";
                SaveToCsv(allData, csvPath);
                Console.WriteLine($"✅ Dữ liệu đã được lưu vào {csvPath}!");
            }
            else
            {
                Console.WriteLine("⚠ Không có dữ liệu nào để lưu!");
                return;
            }
           
            // 4️⃣ Huấn luyện mô hình ML.NET
            var mlContext = new MLContext();
            var dataView = mlContext.Data.LoadFromTextFile<ModelInput>("datasets/training_data.csv", hasHeader: true, separatorChar: ',');
            var pipeline = mlContext.Transforms.Text.FeaturizeText("Features", nameof(ModelInput.Content))
                .Append(mlContext.BinaryClassification.Trainers.SdcaLogisticRegression(labelColumnName: nameof(ModelInput.Label), featureColumnName: "Features"));
            var model = pipeline.Fit(dataView);

            // 5️⃣ Lưu mô hình ra file .zip
            string modelPath = "E:\\DOANTOTNGHIEP\\Code\\DuyTanSharingSystem\\Application\\Model\\ML\\spam_detection_model.zip";
            mlContext.Model.Save(model, dataView.Schema, modelPath);
            Console.WriteLine("✅ Mô hình đã được huấn luyện và lưu!");
        }

        private static void SaveToCsv(List<ModelInput> data, string filePath)
        {
            try
            {
                var config = new CsvConfiguration(CultureInfo.InvariantCulture)
                {
                    ShouldQuote = _ => false,
                    TrimOptions = TrimOptions.Trim,
                    Delimiter = ",",
                    Encoding = Encoding.UTF8
                };

                using var writer = new StreamWriter(filePath, false, new UTF8Encoding(true));
                using var csv = new CsvWriter(writer, config);

                csv.WriteHeader<ModelInput>();
                csv.NextRecord();
                foreach (var item in data)
                {
                    item.Content = item.Content.Replace("\n", " ").Replace("\r", " ").Replace(",", " ");
                    csv.WriteRecord(item);
                    csv.NextRecord();
                }

                Console.WriteLine($"✅ Dữ liệu đã được lưu vào {filePath}!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Lỗi khi lưu CSV: {ex.Message}");
            }
        }
    }

    // Model dữ liệu
    public class ModelInput
    {
        public string Content { get; set; } = "";
        public bool Label { get; set; }
    }

}

