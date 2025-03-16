using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MLTraining
{
    public class FakeDataGenerator
    {
        private static readonly string[] spamTemplates =
        {
        "Bạn đã trúng thưởng {0}$! Gọi ngay số {1} để nhận thưởng.",
        "Cần bán tài khoản {2} giá rẻ, inbox ngay!",
        "Làm giàu không khó! Đầu tư {0}$ và nhận ngay {3}$ mỗi ngày.",
        "Chuyển khoản {0}$ vào tài khoản {1} để nhận phần thưởng hấp dẫn.",
        "Nhận ngay phần mềm hack {2} miễn phí! Inbox admin để biết thêm chi tiết."
    };

        private static readonly string[] fakeAccounts = { "VIP123", "HACKERPRO", "ADMIN999", "SUPPORT24H" };

        private static Random _random = new Random();

        public static List<ModelInput> GenerateFakeData(int count)
        {
            var data = new List<ModelInput>();

            for (int i = 0; i < count; i++)
            {
                string template = spamTemplates[_random.Next(spamTemplates.Length)];
                string content = string.Format(template, _random.Next(100, 10000), "0901234567", fakeAccounts[_random.Next(fakeAccounts.Length)], _random.Next(500, 5000));

                data.Add(new ModelInput { Content = content, Label = true });
            }

            return data;
        }
    }

}
