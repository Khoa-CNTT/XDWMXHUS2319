using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MLTraining
{
    public class DataAugmenter
    {
        private static readonly List<string> OffensiveWords = new()
    {
        "lừa đảo", "scam", "fake news", "vi phạm pháp luật", "đánh bạc", "bán bằng giả", "hack tài khoản"
    };

        public static List<ModelInput> GenerateNegativeSamples(int count)
        {
            var samples = new List<ModelInput>();
            var random = new Random();

            for (int i = 0; i < count; i++)
            {
                var sentence = $"⚠ Cảnh báo: {OffensiveWords[random.Next(OffensiveWords.Count)]}!";
                samples.Add(new ModelInput { Content = sentence, Label = true });
            }

            return samples;
        }
    }

}
