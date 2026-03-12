# Gson JSON Parsing Benchmark

测试 Gson 解析 JSON 时数据大小（字节数）对耗时的影响。

## 影响因素

- JSON 数据大小（字节数）

## 测试方法

生成 7 种不同大小的 JSON 字符串（1KB 到 10MB），每种大小：

1. 执行 10 次预热（让 JIT 编译优化）
2. 执行 50 次正式测量，计算平均耗时

## 运行方式

### 方式一：直接运行（需要 Java 8+）

```bash
./run.sh
```

### 方式二：Maven 构建（需要 Maven）

```bash
mvn package -q
java -jar target/gson-benchmark-1.0.0-jar-with-dependencies.jar
```

### 方式三：手动编译运行

```bash
# 下载 Gson JAR（仅首次）
curl -sL "https://repo1.maven.org/maven2/com/google/code/gson/gson/2.10.1/gson-2.10.1.jar" \
  -o gson-2.10.1.jar

# 编译
javac -cp gson-2.10.1.jar src/main/java/GsonBenchmark.java -d .

# 运行
java -cp .:gson-2.10.1.jar GsonBenchmark
```

## 示例输出

```
Gson JSON Parsing Benchmark
Factor: JSON data size (bytes)
Warmup iterations : 10
Measure iterations: 50

Size            Actual bytes    Avg time (ms)   MB/s           
--------------------------------------------------------------
1 KB            976             0.145           6.40           
10 KB           10335           0.136           72.55          
100 KB          105182          0.611           164.19         
500 KB          530264          2.946           171.67         
1 MB            1092206         5.951           175.04         
5 MB            5505640         27.998          187.53         
10 MB           11073346        56.340          187.44         
```

## 结果分析

- 随着 JSON 数据量增大，吞吐量（MB/s）逐渐提升并趋于稳定（约 180-190 MB/s）
- 小数据量（< 100KB）由于 JIT 优化不充分，性能较低
- 大数据量（> 1MB）性能趋于稳定，说明 Gson 解析性能在大数据场景下表现良好
