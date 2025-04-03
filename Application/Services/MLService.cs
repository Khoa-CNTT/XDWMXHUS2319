using Application.Model.ML;
using Microsoft.ML;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class MLService
    {
        //private readonly PredictionEngine<ModelInput, ModelOutput> _predictionEngine;

        //public MLService()
        //{
        //    var mlContext = new MLContext();
        //    string modelPath = @"E:\DOANTOTNGHIEP\Code\DuyTanSharingSystem\Application\Model\ML\spam_detection_model.zip";



        //    if (!File.Exists(modelPath))
        //        throw new FileNotFoundException("Không tìm thấy mô hình!", modelPath);

        //    ITransformer mlModel = mlContext.Model.Load(modelPath, out _);
        //    _predictionEngine = mlContext.Model.CreatePredictionEngine<ModelInput, ModelOutput>(mlModel);
        //}

        //public bool Predict(string content)
        //{
        //    var input = new ModelInput { Content = content };
        //    var result = _predictionEngine.Predict(input);
        //    return result.IsSpam; // Nếu true thì vi phạm
        //}
    }
}
