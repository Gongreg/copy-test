Quick sample test mutative performance compared to undrafted objects.

Theres a mock physics library that just moves balls around random and detects collisions. By default there are 30 balls floating around in the simulation.

The test runs raw modifications, then raw modifications with a copy at each iteration, then mutative iterations.

From my Mac M1:

```
RAW     : 5000 iterations @15ms  (0.003 per loop)
RAW+COPY: 5000 iterations @270ms  (0.054 per loop)
MUTATIVE: 5000 iterations @4767ms  (0.9534 per loop)
```

Looking for performance tips on mutative now.
