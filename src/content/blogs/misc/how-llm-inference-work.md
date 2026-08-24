---
title: How LLM Inference Works
date: 2025-12-15T00:00:00.000Z
description: >-
  When you enter a prompt into an LLM, the model converts your text into
  numbers, processes them, and returns a response one token at a time. In this
  article, we go through the journey of LLM inference and see how it works.
tags:
  - LLM
  - AI
aliases:
  - /how-llm-inference-works/
discussions: []
type_label: ''
cover:
  src: ../../../assets/images/site-cover.png
  alt: Mahib's Margins
ogImage: site-cover.png
atUri: 'at://did:plc:miwiepbo3e3sh5fknyt7jxqm/site.standard.document/3mtsy3wvmuw2b'
---

When you enter a prompt into an LLM, the model converts your text into numbers, processes them, and returns a response one token at a time. In this article, we go through the journey of LLM inference and see how it works.

## What are Large Language Models

LLM are just neural networks built on the [transformer architecture](https://arxiv.org/abs/1706.03762). Unlike earlier architectures that processed text sequentially, transformers can analyze entire sequences in parallel, making them more efficient to train and deploy at scale.

The basic building block of these models is the transformer layer, which consists of two primary components:

1. self-attention mechanism
2. feed forward neural network

LLMs stack dozens of these layers, creating deep networks capable of capturing complex patterns in language.

Transformers rely on self-attention and it evaluates how each word relates to the rest of the sequence, not just its neighbouring words.

A large portion model size is contributed from the number of tunable parameters in the network. A 7-billion parameter model has 7 billion floating-point numbers that store the learned knowledge from training. These parameters are organized into weight matrices that perform transformations on the input data at each layer.

Models like GPT-4, Claude, and Llama are decoder-only transformers, meaning they use only the decoder part of the original transformer architecture, which makes them autoregressive, generating one token at a time based on all previously generated tokens, which is perfect for text generation tasks.

## Tokenization

The model needs to convert your text input into numbers. This process, called tokenization, breaks text into smaller units called tokens.

One of the common tokenization approach in LLMs is [Byte Pair Encoding (BPE)](https://en.wikipedia.org/wiki/Byte-pair_encoding). BPE starts with a vocabulary of individual characters and iteratively merges the most frequent pairs of adjacent tokens to create new tokens.

```python
# Input text: "unhappiness"

# Initial: ['u', 'n', 'h', 'a', 'p', 'p', 'i', 'n', 'e', 's', 's']
# After merges: ['un', 'happi', 'ness']
```

Because of BPE, common words get represented as single tokens (efficient), while rare or unknown words get broken into familiar subword pieces (flexible).

The tokenization process works by encoding your input text into `UTF-8 bytes`, then applying the learned merge rules to compress the `byte sequence` into `tokens`. Each `token` maps to an `integer ID` that the model can work with. (In order to visualize this process you can check out: [tiktokenizer](https://tiktokenizer.vercel.app/))

```python
# Simplified tokenization example
text = "The AI model generates text"
tokens = tokenizer.encode(text)
# [464, 15592, 2746, 18616, 2420]o
```

Tokenization directly impacts model performance and costs. More tokens mean more computation, higher API costs, and potentially hitting context length limits. This is why non-English text often costs more to process since these languages typically require more tokens per word when the tokenizer was primarily trained on English data.

## Token Embeddings

Once text becomes tokens, the next step transforms these discrete token IDs into continuous vector representations that neural networks can process. This happens through an embedding layer, essentially a lookup table that maps each token ID to a high-dimensional vector.

For a model with a vocabulary of 50,000 tokens and an embedding dimension of 4,096, the embedding matrix has shape [50000, 4096]. Each row represents one token, and the values in that row form the embedding vector for that token.

```python
token_id = 464  # Token ID for "The"
embedding_vector = embedding_matrix[token_id]
# Result: a vector of 4096 floating-point numbers
```

These embedding vectors capture semantic meaning learned during training. Words with similar meanings have embedding vectors that point in similar directions in this high-dimensional space.

Transformers do not inherently understand the order of tokens. To address this, we add positional encodings to the embeddings, providing information about where each token sits in the sequence. Modern approaches use learned positional embeddings or relative position encodings like [Rotary Position Embeddings (RoPE)](https://arxiv.org/abs/2104.09864).

## Transformer Architecture

The transformer processes embedding vectors through its layers. Each transformer layer applies two main operations: `multi-head self-attention` and `feed-forward networks`.

The self-attention mechanism computes three matrices for each token: `Query (Q)`, `Key (K)`, and `Value (V)`. These come from multiplying the input embeddings by three learned weight matrices.

```python
# Self-attention computation
Q = input @ W_query   # Shape: [batch, seq_len, dim]
K = input @ W_key     # Shape: [batch, seq_len, dim]
V = input @ W_value   # Shape: [batch, seq_len, dim]
```

The weight matrices `W_Q`, `W_K`, and `W_V` are learned during training. They are randomly initialized and then adjusted through backpropagation to extract the most useful patterns from the embeddings.

The attention mechanism then computes how much each token should attend to every other token. This happens through a `scaled dot-product` attention calculation:

```python
scores = (Q @ K.transpose()) / sqrt(dim)
attention_weights = softmax(scores)
output = attention_weights @ V
```

Multi-head attention runs this process multiple times in parallel with different learned projection matrices. A model might use 32 attention heads, each learning to focus on different aspects of the relationships between tokens. The outputs from all heads get concatenated and projected back to the model dimension.

After attention, the output passes through a feed-forward network, which consists of two linear transformations with a non-linear activation function in between. This typically expands the dimensionality by 4x before projecting back down.

```python
hidden = activation(input @ W1 + b1)   # Expand to 4x dimension
output = hidden @ W2 + b2              # Project back down
```

## Inference Phases

The prefill phase happens when you first submit a prompt. The model processes all input tokens in parallel, computing the `Query`, `Key`, and `Value` matrices for each token simultaneously. This phase is compute-bound, meaning the GPU’s computational throughput determines performance.

During prefill, the attention mechanism performs matrix-matrix multiplication, which GPUs excel at. All tokens can see all other tokens (in the input), and the model computes attention scores for every pair of positions in one batch operation.

```python
input_tokens = [token_1, token_2, ..., token_n]
# Process all tokens at once
for layer in model.layers:
    Q, K, V = compute_qkv(input_tokens)
    attention_output = attention(Q, K, V)
    layer_output = feedforward(attention_output)
```

The prefill stage creates the KV cache, which we will talk about in a moment, and generates the first output token. The duration of this phase is measured by Time to First Token (TTFT), which has a direct effect on the user experience because it is the amount of time that must pass before any output is seen.

After the first token is generated, the decode phase starts. The model generates tokens in an autoregressive manner, one at a time. Only the most recent token requires new Q, K, and V calculations; all prior tokens are used to calculate each new token.

Instead of being compute-bound, this phase is memory-bound. Instead of doing calculations, the GPU spends the majority of its time loading data from memory. Instead of using a matrix-matrix operation for each iteration, a matrix-vector operation is used, which results in far less computational effort to overload the GPU.

```python
current_token = first_generated_token
while not done:
    # Only compute for the new token
    q_new = compute_query(current_token)

    # Retrieve cached K, V from previous tokens
    k_cached, v_cached = retrieve_cache()

    # Compute attention with cached values
    attention_output = attention(q_new, k_cached, v_cached)

    next_token = generate_token(attention_output)
    current_token = next_token
```

## KV Cache

KV cache represents one of the most important optimizations in transformer inference. Without it, generating 100 tokens would require recomputing attention for all previous tokens 100 times, wasting enormous computational resources.

During autoregressive generation, the Key and Value matrices for previously processed tokens never change. Only the Query matrix for the new token needs computation. By **caching** the `K` and `V` matrices from all previous tokens, we avoid recomputing them.

```python
class KVCache:
    def __init__(self):
        self.cache_k = None
        self.cache_v = None

    def update(self, new_k, new_v):
        if self.cache_k is None:
            self.cache_k = new_k
            self.cache_v = new_v
        else:
            # Concatenate new K, V with cached values
            self.cache_k = concat([self.cache_k, new_k], dim=1)
            self.cache_v = concat([self.cache_v, new_v], dim=1)

    def get(self):
        return self.cache_k, self.cache_v
```

For each layer and each attention head, the model maintains separate KV caches. When generating the nth token, the cache stores `K` and `V` matrices for all `n-1` previous tokens.

`KV cache` comes with a `memory cost`. The cache grows linearly with sequence length. For a 13-billion parameter model like LLaMA-2, each output token requires approximately `1 MB` of cache storage. A `4,000 token` context needs about `4 GB` just for the cache, comparable to the model size itself.

In order to reduce such high memory pressure, modern systems employ several strategies to manage KV cache memory: `quantizing the cache` to `lower precision` (4-bit or 2-bit keys and values), using `sliding window attention` that only retains recent tokens, or implementing attention approximations that reduce cache requirements.

## Precision and Quantization in Inference

LLM inference often operates at reduced precision compared to training. While training typically uses [FP32 or BF16 precision](https://moocaholic.medium.com/fp64-fp32-fp16-bfloat16-tf32-and-other-members-of-the-zoo-a1ca7897d407), inference can use FP16, INT8, or even INT4 with minimal quality loss.

FP16 (16-bit floating point) cuts memory usage and bandwidth requirements in half compared to FP32. Tensor Cores achieve maximum throughput at FP16, making it the default precision for many inference deployments.

Quantization converts model weights and activations to lower precision formats. This requires careful calibration to maintain model quality. Post-training quantization analyzes activation distributions on representative data to determine optimal scaling factors.

A 7-billion parameter model at FP16 precision requires approximately 14 GB of memory (7B parameters × 2 bytes per parameter). Quantizing to INT4 reduces this to 3.5 GB, enabling inference on consumer hardware.

Quantization techniques like [GPTQ](https://arxiv.org/abs/2210.17323) and [AWQ](https://arxiv.org/abs/2306.00978) apply different scaling factors per channel or per group, preserving more information from the original weights. Some methods quantize weights but keep activations at higher precision, balancing quality and performance.

## Performance Metrics and Monitoring

Understanding and monitoring inference performance requires tracking several key metrics.

Time to First Token (TTFT) measures prefill phase latency. This directly impacts user experience since users wait this long before seeing any output. Optimizing TTFT means efficient prompt processing, often through batch prefill or speculative decoding techniques.

Inter-Token Latency (ITL) measures the time between consecutive tokens during decode. Low ITL creates smooth streaming experiences. This metric depends heavily on memory bandwidth and KV cache efficiency.

Throughput, measured in tokens per second, indicates overall system capacity. High throughput means serving more users concurrently. Batching strategies significantly impact throughput.

```python
start_time = time.now()
first_token = model.generate_first_token(prompt)
ttft = time.now() - start_time

token_times = []
for i in range(num_tokens):
    token_start = time.now()
    token = model.generate_next_token()
    token_times.append(time.now() - token_start)

itl = mean(token_times)
throughput = num_tokens / sum(token_times)
```

GPU utilization indicates how effectively the hardware is being used. Low utilization during decode suggests memory bottlenecks. Monitoring tools like nvidia-smi show GPU usage, memory consumption, and power draw in real-time.

Memory pressure, especially KV cache size, affects maximum context length and batch size. Tracking cache memory helps prevent out-of-memory errors and guides quantization decisions.

## Remarks

LLM inference transforms text prompts into responses through a process involving tokenization, transformer layers with self-attention mechanisms, and autoregressive token generation.

There are two stages in practice: the model first handles your full prompt in parallel, then switches to generating tokens one by one, which shifts the bottleneck from math to memory access.

Key optimizations include KV caching to avoid redundant computation, batching to improve GPU utilization, and quantization to reduce memory pressure.
