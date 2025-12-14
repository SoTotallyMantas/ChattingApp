
using System.Linq;
using Microsoft.ML.OnnxRuntime;
using backend.Interfaces;
using Microsoft.ML.OnnxRuntime.Tensors;
using Microsoft.ML.Tokenizers;
namespace backend.Services
{
    public class EmbeddingService : IEmbeddingService
    {

        private readonly InferenceSession _inferenceSession;
        private readonly BertTokenizer _tokenizer;
        private const int HiddenSize = 384;
        private const int MaxTokens = 256;

        public EmbeddingService()
        {
            string modelPath = Environment.GetEnvironmentVariable("ONNX_MODEL") ?? throw new InvalidOperationException("ONNX_MODEL_PATH not set");
            string vocabPath = Environment.GetEnvironmentVariable("ONNX_VOCAB") ?? throw new InvalidOperationException("ONNX_VOCAB_PATH not set");

            _inferenceSession = new InferenceSession(modelPath);
            _tokenizer = BertTokenizer.Create(
                vocabPath,
                new BertOptions
                {
                    LowerCaseBeforeTokenization = true
                }
             );
        }

        public float[] Embed(string text)
        {

            var encoding = _tokenizer.EncodeToIds(text, MaxTokens, true, out string? normalized, out int consumed, true, true);

            long[] inputIds = encoding.Select(i => (long)i).ToArray();
            long[] attentionMask = inputIds.Select(_ => 1L).ToArray();
            long[] tokenTypeIds = inputIds.Select(_ => 0L).ToArray();

            var idsTensor = new DenseTensor<long>([1, inputIds.Length]);
            var maskTensor = new DenseTensor<long>([1, inputIds.Length]);
            var typeTensor = new DenseTensor<long>([1, inputIds.Length]);
            for (int i = 0; i < inputIds.Length; i++)
            {
                idsTensor[0, i] = inputIds[i];
                maskTensor[0, i] = attentionMask[i];
                typeTensor[0, i] = tokenTypeIds[i];
            }

            using var results = _inferenceSession.Run(
            [
                NamedOnnxValue.CreateFromTensor("input_ids",idsTensor),
                NamedOnnxValue.CreateFromTensor("attention_mask", maskTensor),
                NamedOnnxValue.CreateFromTensor("token_type_ids", typeTensor)
            ]);

            var rawOutput = results.First().AsTensor<float>().ToArray();

            return Reduction(rawOutput, inputIds.Length);

        }

        private static float[] Reduction(float[] data, int seqLen)
        {
            var output = new float[HiddenSize];

            for (int t = 0; t < seqLen; t++)
            {
                for (int h = 0; h < HiddenSize; h++)
                {
                    output[h] += data[t * HiddenSize + h];
                }
            }


            for (int h = 0; h < HiddenSize; h++)
            {
                output[h] /= seqLen;
            }
            return output;
        }


        public void Dispose()
        {
            _inferenceSession.Dispose();
        }
    }

}
