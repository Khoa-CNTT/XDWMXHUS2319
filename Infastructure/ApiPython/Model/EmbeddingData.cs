using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.TogetherAi.Model
{
    public class EmbeddingData
    {
        public float[] Embedding { get; set; } = Array.Empty<float>(); // ✅ Đúng, tạo mảng rỗng mặc định
                                                                       // ✅ Không giới hạn số phần tử
    }


}
