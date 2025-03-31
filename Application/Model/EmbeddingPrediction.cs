using Microsoft.ML.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Model
{
    public class EmbeddingPrediction
    {
        [ColumnName("last_hidden_state")]
        public float[][] Embedding { get; set; }
    }


}
